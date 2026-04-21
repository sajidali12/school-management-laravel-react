import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Section } from '@/types';

interface Props {
    section: Section | null;
    classes: { id: number; name: string }[];
    teachers: { id: number; first_name: string; last_name: string }[];
}

export default function Form({ section, classes, teachers }: Props) {
    const isEdit = Boolean(section);
    const { data, setData, post, put, processing, errors } = useForm({
        school_class_id: section?.school_class_id ? String(section.school_class_id) : '',
        name: section?.name ?? '',
        room: section?.room ?? '',
        capacity: section?.capacity ?? '',
        class_teacher_id: section?.class_teacher_id ? String(section.class_teacher_id) : '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/sections/${section!.id}`);
        } else {
            post('/sections');
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Section' : 'New Section'}
            description={isEdit ? `Editing section ${section!.name}` : 'Create a new section'}
            actions={
                <Button asChild variant="outline">
                    <Link href="/sections">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Section' : 'New Section'} />

            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Section Details</CardTitle>
                        <CardDescription>Assign this section to a class</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Class" error={errors.school_class_id} required>
                            <Select value={data.school_class_id} onValueChange={(v) => setData('school_class_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Name" error={errors.name} required>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="A, B, Green..." />
                        </Field>
                        <Field label="Class Teacher" error={errors.class_teacher_id}>
                            <Select
                                value={data.class_teacher_id || '__none__'}
                                onValueChange={(v) => setData('class_teacher_id', v === '__none__' ? '' : v)}
                            >
                                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">—</SelectItem>
                                    {teachers.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.first_name} {t.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Room" error={errors.room}>
                            <Input value={data.room ?? ''} onChange={(e) => setData('room', e.target.value)} placeholder="Room 101" />
                        </Field>
                        <Field label="Capacity" error={errors.capacity}>
                            <Input
                                type="number"
                                min={1}
                                max={200}
                                value={data.capacity ?? ''}
                                onChange={(e) => setData('capacity', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/sections">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Section' : 'Create Section'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}

function Field({
    label,
    error,
    required,
    className,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <Label>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
