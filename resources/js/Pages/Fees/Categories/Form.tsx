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
import type { FeeCategory } from '@/types';

interface Props {
    category: FeeCategory | null;
}

export default function Form({ category }: Props) {
    const isEdit = Boolean(category);
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        frequency: category?.frequency ?? 'monthly',
        is_active: category?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/fee-categories/${category!.id}`);
        } else {
            post('/fee-categories');
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Fee Category' : 'New Fee Category'}
            description="Fee category (Tuition, Exam, Transport, etc.)"
            actions={
                <Button asChild variant="outline">
                    <Link href="/fee-categories">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Fee Category' : 'New Fee Category'} />

            <form onSubmit={submit} className="mx-auto max-w-xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Define the category and billing frequency</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Field label="Name" error={errors.name} required>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Tuition Fee" />
                        </Field>
                        <Field label="Frequency" error={errors.frequency} required>
                            <Select value={data.frequency} onValueChange={(v) => setData('frequency', v as FeeCategory['frequency'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="one_time">One Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Status" error={errors.is_active}>
                            <Select value={data.is_active ? '1' : '0'} onValueChange={(v) => setData('is_active', v === '1')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Description" error={errors.description}>
                            <Textarea rows={3} value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} />
                        </Field>
                    </CardContent>
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/fee-categories">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}

function Field({ label, error, required, className, children }: { label: string; error?: string; required?: boolean; className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
