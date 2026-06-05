import { FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Section { id: number; name: string; school_class?: { name: string } }
interface Subject { id: number; name: string; code: string }
interface Assignment {
    id?: number;
    title: string; instructions: string | null; due_date: string;
    total_marks: string | null; section_id: number; subject_id: number | null;
    file_name: string | null; file_url: string | null;
}

interface Props { assignment: Assignment | null; sections: Section[]; subjects: Subject[] }

export default function AssignmentForm({ assignment, sections, subjects }: Props) {
    const isEdit = !!assignment?.id;

    const { data, setData, processing, errors } = useForm({
        section_id:   assignment?.section_id ? String(assignment.section_id) : '',
        subject_id:   assignment?.subject_id ? String(assignment.subject_id) : '',
        title:        assignment?.title ?? '',
        instructions: assignment?.instructions ?? '',
        due_date:     assignment?.due_date ? assignment.due_date.slice(0, 16) : '',
        total_marks:  assignment?.total_marks ?? '',
        file:         null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            router.post(`/teacher/assignments/${assignment!.id}`, { ...data, _method: 'PUT' }, { forceFormData: true });
        } else {
            router.post('/teacher/assignments', data, { forceFormData: true });
        }
    };

    return (
        <TeacherLayout title={isEdit ? 'Edit Assignment' : 'New Assignment'}>
            <Head title={isEdit ? 'Edit Assignment' : 'New Assignment'} />

            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <InputLabel value="Section *" />
                                <Select value={data.section_id} onValueChange={(v) => setData('section_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                                    <SelectContent>
                                        {sections.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.school_class?.name} — {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.section_id} />
                            </div>
                            <div className="space-y-1.5">
                                <InputLabel value="Subject (optional)" />
                                <Select value={data.subject_id || '__none__'} onValueChange={(v) => setData('subject_id', v === '__none__' ? '' : v)}>
                                    <SelectTrigger><SelectValue placeholder="No specific subject" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">General</SelectItem>
                                        {subjects.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.code} — {s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <InputLabel value="Title *" />
                            <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Algebra Practice Problems" />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-1.5">
                            <InputLabel value="Instructions" />
                            <textarea
                                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                rows={5}
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                placeholder="Describe the assignment, requirements, submission format..."
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <InputLabel value="Due Date & Time *" />
                                <Input type="datetime-local" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                <InputError message={errors.due_date} />
                            </div>
                            <div className="space-y-1.5">
                                <InputLabel value="Total Marks (optional)" />
                                <Input type="number" min="0" step="0.5" value={data.total_marks} onChange={(e) => setData('total_marks', e.target.value)} placeholder="e.g. 20" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <InputLabel value="Attachment (optional, max 10 MB)" />
                            {assignment?.file_name && !data.file && (
                                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                    Current file: <a href={assignment.file_url!} target="_blank" rel="noreferrer" className="text-primary hover:underline">{assignment.file_name}</a>
                                </div>
                            )}
                            <Input type="file" onChange={(e) => setData('file', e.target.files?.[0] ?? null)} />
                            {data.file && <p className="text-xs text-muted-foreground">Selected: {data.file.name}</p>}
                            <InputError message={errors.file} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
                    <Button type="submit" disabled={processing}>
                        {isEdit ? 'Update Assignment' : 'Create & Notify Students'}
                    </Button>
                </div>
            </form>
        </TeacherLayout>
    );
}
