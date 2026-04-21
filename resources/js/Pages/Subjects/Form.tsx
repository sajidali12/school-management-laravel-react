import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Subject } from '@/types';

interface Props {
    subject: Subject | null;
    classes: { id: number; name: string }[];
    assignedClasses: number[];
}

export default function Form({ subject, classes, assignedClasses }: Props) {
    const isEdit = Boolean(subject);
    const { data, setData, post, put, processing, errors } = useForm({
        code: subject?.code ?? '',
        name: subject?.name ?? '',
        description: subject?.description ?? '',
        is_active: subject?.is_active ?? true,
        class_ids: assignedClasses ?? [],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/subjects/${subject!.id}`);
        } else {
            post('/subjects');
        }
    };

    const toggleClass = (id: number) => {
        const next = data.class_ids.includes(id)
            ? data.class_ids.filter((x) => x !== id)
            : [...data.class_ids, id];
        setData('class_ids', next);
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Subject' : 'New Subject'}
            description={isEdit ? `Editing ${subject!.name}` : 'Create a new subject'}
            actions={
                <Button asChild variant="outline">
                    <Link href="/subjects">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Subject' : 'New Subject'} />

            <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Subject identity and code</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Code" error={errors.code} required>
                            <Input value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="MATH101" />
                        </Field>
                        <Field label="Name" error={errors.name} required>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Mathematics" />
                        </Field>
                        <Field label="Status" error={errors.is_active} required>
                            <Select
                                value={data.is_active ? '1' : '0'}
                                onValueChange={(v) => setData('is_active', v === '1')}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Description" error={errors.description} className="md:col-span-2">
                            <Textarea rows={3} value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} />
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Classes</CardTitle>
                        <CardDescription>Classes that teach this subject</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {classes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No classes yet.</p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {classes.map((c) => {
                                    const checked = data.class_ids.includes(c.id);
                                    return (
                                        <button
                                            type="button"
                                            key={c.id}
                                            onClick={() => toggleClass(c.id)}
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
                                            <span className="truncate">{c.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/subjects">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Subject' : 'Create Subject'}
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
