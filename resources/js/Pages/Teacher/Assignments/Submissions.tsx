import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Download, Star } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { initials } from '@/lib/utils';

interface Student { id: number; first_name: string; last_name: string; roll_number: string }
interface Submission {
    id: number; student_id: number; status: string;
    file_name: string | null; file_url: string | null;
    submitted_at: string | null; marks: string | null; feedback: string | null;
}
interface Assignment {
    id: number; title: string; due_date: string; total_marks: string | null;
    section?: { name: string; school_class?: { name: string } };
    subject?: { name: string; code: string } | null;
}

interface Props { assignment: Assignment; students: Student[]; submissions: Submission[] }

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'outline' | 'secondary' }> = {
    pending:   { label: 'Not Submitted', variant: 'outline' },
    submitted: { label: 'Submitted',     variant: 'warning' },
    graded:    { label: 'Graded',        variant: 'success' },
};

function fmt(d: string | null) {
    return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

interface GradeState { submissionId: number; studentName: string; marks: string; feedback: string; totalMarks: string | null }

export default function Submissions({ assignment, students, submissions }: Props) {
    const [gradeState, setGradeState] = useState<GradeState | null>(null);
    const subMap = Object.fromEntries(submissions.map((s) => [s.student_id, s]));

    const submitted = submissions.filter((s) => s.status !== 'pending').length;
    const graded    = submissions.filter((s) => s.status === 'graded').length;

    const openGrade = (student: Student) => {
        const sub = subMap[student.id];
        if (!sub) return;
        setGradeState({
            submissionId: sub.id,
            studentName:  `${student.first_name} ${student.last_name}`,
            marks:        sub.marks ?? '',
            feedback:     sub.feedback ?? '',
            totalMarks:   assignment.total_marks,
        });
    };

    const submitGrade = (e: FormEvent) => {
        e.preventDefault();
        if (!gradeState) return;
        router.patch(`/teacher/assignment-submissions/${gradeState.submissionId}/grade`, {
            marks:    gradeState.marks || null,
            feedback: gradeState.feedback || null,
        }, { onSuccess: () => setGradeState(null) });
    };

    return (
        <TeacherLayout title="Submissions" description={assignment.title}>
            <Head title="Submissions" />

            <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{students.length}</p>
                            <p className="text-xs text-muted-foreground">Total Students</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-amber-600">{submitted}</p>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-600">{graded}</p>
                            <p className="text-xs text-muted-foreground">Graded</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead className="w-24 text-right">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((s) => {
                                    const sub = subMap[s.id] ?? null;
                                    const status = sub?.status ?? 'pending';
                                    return (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                            {initials(`${s.first_name} ${s.last_name}`)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{s.first_name} {s.last_name}</p>
                                                        <p className="text-xs text-muted-foreground">{s.roll_number}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusConfig[status]?.variant ?? 'outline'}>
                                                    {statusConfig[status]?.label ?? status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{fmt(sub?.submitted_at ?? null)}</TableCell>
                                            <TableCell>
                                                {sub?.file_url
                                                    ? <a href={sub.file_url} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                        <Download className="h-3 w-3" />{sub.file_name}
                                                      </a>
                                                    : <span className="text-xs text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {sub?.marks != null
                                                    ? <span>{sub.marks}{assignment.total_marks ? `/${assignment.total_marks}` : ''}</span>
                                                    : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {sub && status !== 'pending' && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openGrade(s)}>
                                                        <Star className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!gradeState} onOpenChange={(o) => !o && setGradeState(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                        {gradeState && <p className="text-sm text-muted-foreground">{gradeState.studentName}</p>}
                    </DialogHeader>
                    {gradeState && (
                        <form onSubmit={submitGrade} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Marks {gradeState.totalMarks ? `(out of ${gradeState.totalMarks})` : ''}</Label>
                                <Input
                                    type="number" step="0.5" min="0"
                                    max={gradeState.totalMarks ?? undefined}
                                    value={gradeState.marks}
                                    onChange={(e) => setGradeState({ ...gradeState, marks: e.target.value })}
                                    placeholder="e.g. 17"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Feedback (optional)</Label>
                                <textarea
                                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    rows={3}
                                    value={gradeState.feedback}
                                    onChange={(e) => setGradeState({ ...gradeState, feedback: e.target.value })}
                                    placeholder="Comments for the student..."
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setGradeState(null)}>Cancel</Button>
                                <Button type="submit">Save Grade</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </TeacherLayout>
    );
}
