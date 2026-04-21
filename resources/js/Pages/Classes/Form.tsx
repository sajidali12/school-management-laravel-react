import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { SchoolClass } from '@/types';

interface Props {
    schoolClass: SchoolClass | null;
    subjectOptions: { id: number; code: string; name: string }[];
    assignedSubjects: number[];
}

export default function Form({ schoolClass, subjectOptions, assignedSubjects }: Props) {
    const isEdit = Boolean(schoolClass);
    const { data, setData, post, put, processing, errors } = useForm({
        name: schoolClass?.name ?? '',
        level: schoolClass?.level ?? '',
        description: schoolClass?.description ?? '',
        subject_ids: assignedSubjects ?? [],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/classes/${schoolClass!.id}`);
        } else {
            post('/classes');
        }
    };

    const toggleSubject = (id: number) => {
        const next = data.subject_ids.includes(id)
            ? data.subject_ids.filter((x) => x !== id)
            : [...data.subject_ids, id];
        setData('subject_ids', next);
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Class' : 'New Class'}
            description={isEdit ? `Editing ${schoolClass!.name}` : 'Create a new class or grade'}
            actions={
                <Button asChild variant="outline">
                    <Link href="/classes">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Class' : 'New Class'} />

            <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Class name and grade level</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Name" error={errors.name} required>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Class 5 / FSc Part 1" />
                        </Field>
                        <Field label="Level" error={errors.level} hint="Numeric grade used for sorting">
                            <Input
                                type="number"
                                min={1}
                                max={20}
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </Field>
                        <Field label="Description" error={errors.description} className="md:col-span-2">
                            <Textarea
                                rows={3}
                                value={data.description ?? ''}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Subjects</CardTitle>
                        <CardDescription>Select the subjects taught in this class</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subjectOptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No subjects yet. Create subjects first.</p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {subjectOptions.map((s) => {
                                    const checked = data.subject_ids.includes(s.id);
                                    return (
                                        <button
                                            type="button"
                                            key={s.id}
                                            onClick={() => toggleSubject(s.id)}
                                            className={cn(
                                                'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition',
                                                checked
                                                    ? 'border-primary bg-primary/5 text-foreground'
                                                    : 'border-input hover:bg-accent',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-4 w-4 items-center justify-center rounded border',
                                                    checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                                                )}
                                            >
                                                {checked && (
                                                    <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2.5 6l2.5 2.5L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                                                )}
                                            </span>
                                            <span className="font-mono text-xs text-muted-foreground">{s.code}</span>
                                            <span className="truncate">{s.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/classes">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Class' : 'Create Class'}
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
    hint,
    className,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <Label>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
