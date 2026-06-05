import { FormEvent, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Paperclip, X } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

interface Section { id: number; name: string; school_class?: { name: string } }
interface Subject { id: number; name: string; code: string }
interface Plan {
    id?: number;
    title: string;
    description: string | null;
    week_start_date: string;
    section_id: number;
    subject_id: number | null;
    file_name: string | null;
    file_url: string | null;
}

interface Props { plan: Plan | null; sections: Section[]; subjects: Subject[] }

export default function LessonPlanForm({ plan, sections, subjects }: Props) {
    const isEdit = !!plan?.id;
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        section_id:      plan?.section_id ? String(plan.section_id) : '',
        subject_id:      plan?.subject_id ? String(plan.subject_id) : '',
        title:           plan?.title ?? '',
        description:     plan?.description ?? '',
        week_start_date: plan?.week_start_date ?? '',
        file:            null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            router.post(`/teacher/lesson-plans/${plan!.id}`, { ...data, _method: 'PUT' }, { forceFormData: true });
        } else {
            router.post('/teacher/lesson-plans', data, { forceFormData: true });
        }
    };

    return (
        <TeacherLayout title={isEdit ? 'Edit Lesson Plan' : 'New Lesson Plan'}>
            <Head title={isEdit ? 'Edit Lesson Plan' : 'New Lesson Plan'} />

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
                                    <SelectTrigger><SelectValue placeholder="General / All subjects" /></SelectTrigger>
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
                            <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Chapter 3 — Algebra Basics" />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-1.5">
                            <InputLabel value="Description" />
                            <textarea
                                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Topics to be covered, learning objectives..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <InputLabel value="Week Starting *" />
                            <Input type="date" value={data.week_start_date} onChange={(e) => setData('week_start_date', e.target.value)} />
                            <InputError message={errors.week_start_date} />
                        </div>

                        <div className="space-y-1.5">
                            <InputLabel value="Attachment (optional, max 10 MB)" />
                            {plan?.file_name && !data.file && (
                                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <a href={plan.file_url!} target="_blank" rel="noreferrer" className="flex-1 text-primary hover:underline truncate">{plan.file_name}</a>
                                </div>
                            )}
                            <Input
                                ref={fileRef}
                                type="file"
                                onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                            />
                            {data.file && <p className="text-xs text-muted-foreground">Selected: {data.file.name}</p>}
                            <InputError message={errors.file} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
                    <Button type="submit" disabled={processing}>
                        {isEdit ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </div>
            </form>
        </TeacherLayout>
    );
}
