import { FormEvent, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, Download, Star, Upload } from 'lucide-react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Submission {
    id: number; status: 'pending' | 'submitted' | 'graded';
    file_name: string | null; file_url: string | null;
    submitted_at: string | null; marks: string | null; feedback: string | null;
}

interface Assignment {
    id: number; title: string; instructions: string | null;
    due_date: string; total_marks: string | null;
    file_name: string | null; file_url: string | null;
    subject?: { name: string; code: string } | null;
    teacher?: { full_name: string };
    my_submission: Submission | null;
}

interface Props { assignments: Assignment[]; studentId: number }

function dueInfo(due: string): { label: string; color: string; icon: JSX.Element } {
    const diff = new Date(due).getTime() - Date.now();
    if (diff < 0) return { label: 'Overdue', color: 'text-rose-600', icon: <AlertCircle className="h-3.5 w-3.5" /> };
    if (diff < 86400000) return { label: 'Due today', color: 'text-amber-600', icon: <Clock className="h-3.5 w-3.5" /> };
    if (diff < 86400000 * 3) return { label: 'Due soon', color: 'text-amber-500', icon: <Clock className="h-3.5 w-3.5" /> };
    return { label: new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), color: 'text-muted-foreground', icon: <Clock className="h-3.5 w-3.5" /> };
}

function statusConfig(status: string) {
    if (status === 'graded')    return { label: 'Graded',         variant: 'success' as const, icon: <Star className="h-3.5 w-3.5" /> };
    if (status === 'submitted') return { label: 'Submitted',      variant: 'info' as const,    icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    return                             { label: 'Not Submitted',  variant: 'outline' as const, icon: <Upload className="h-3.5 w-3.5" /> };
}

export default function StudentAssignments({ assignments, studentId }: Props) {
    const [submitFor, setSubmitFor] = useState<Assignment | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const doSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!submitFor || !file) return;
        const form = new FormData();
        form.append('file', file);
        router.post(`/student/assignments/${submitFor.id}/submit`, form, {
            forceFormData: true,
            onSuccess: () => { setSubmitFor(null); setFile(null); },
        });
    };

    const pending   = assignments.filter((a) => !a.my_submission || a.my_submission.status === 'pending').length;
    const submitted = assignments.filter((a) => a.my_submission?.status === 'submitted').length;
    const graded    = assignments.filter((a) => a.my_submission?.status === 'graded').length;

    return (
        <StudentLayout title="Assignments" description="View and submit your assignments">
            <Head title="Assignments" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card><CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-rose-600">{pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-sky-600">{submitted}</p>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{graded}</p>
                        <p className="text-xs text-muted-foreground">Graded</p>
                    </CardContent></Card>
                </div>

                {assignments.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center text-sm text-muted-foreground">
                            No assignments posted yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {assignments.map((a) => {
                            const sub   = a.my_submission;
                            const sc    = statusConfig(sub?.status ?? 'pending');
                            const due   = dueInfo(a.due_date);
                            const isPastDue = new Date(a.due_date) < new Date();

                            return (
                                <Card key={a.id} className={isPastDue && !sub ? 'border-rose-200' : ''}>
                                    <CardContent className="p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold">{a.title}</h3>
                                                    {a.subject && <Badge variant="outline" className="text-xs">{a.subject.code}</Badge>}
                                                    <Badge variant={sc.variant} className="flex items-center gap-1 text-xs">
                                                        {sc.icon}{sc.label}
                                                    </Badge>
                                                </div>

                                                <div className={`mt-1 flex items-center gap-1 text-xs ${due.color}`}>
                                                    {due.icon}
                                                    <span>{due.label}</span>
                                                    {a.total_marks && <span className="ml-2 text-muted-foreground">· {a.total_marks} marks</span>}
                                                </div>

                                                {a.instructions && (
                                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.instructions}</p>
                                                )}

                                                <div className="mt-2 flex flex-wrap gap-3">
                                                    {a.file_url && (
                                                        <a href={a.file_url} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                            <Download className="h-3.5 w-3.5" /> {a.file_name}
                                                        </a>
                                                    )}
                                                    {sub?.file_url && (
                                                        <a href={sub.file_url} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> My submission: {sub.file_name}
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Grade feedback */}
                                                {sub?.status === 'graded' && (
                                                    <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm">
                                                        <p className="font-semibold text-emerald-800">
                                                            Marks: {sub.marks}{a.total_marks ? `/${a.total_marks}` : ''}
                                                        </p>
                                                        {sub.feedback && <p className="mt-1 text-emerald-700">{sub.feedback}</p>}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant={sub && sub.status !== 'pending' ? 'outline' : 'default'}
                                                    onClick={() => setSubmitFor(a)}
                                                    className="gap-1.5"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    {sub && sub.status !== 'pending' ? 'Re-submit' : 'Submit'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Submit dialog */}
            <Dialog open={!!submitFor} onOpenChange={(o) => { if (!o) { setSubmitFor(null); setFile(null); } }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Submit Assignment</DialogTitle>
                        {submitFor && <p className="text-sm text-muted-foreground">{submitFor.title}</p>}
                    </DialogHeader>
                    <form onSubmit={doSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Upload your work (max 20 MB)</p>
                            <Input
                                ref={fileRef}
                                type="file"
                                required
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                            {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setSubmitFor(null); setFile(null); }}>Cancel</Button>
                            <Button type="submit" disabled={!file}>Submit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
