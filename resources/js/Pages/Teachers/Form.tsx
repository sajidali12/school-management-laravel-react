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
import type { Teacher } from '@/types';

interface Props {
    teacher: Teacher | null;
}

export default function Form({ teacher }: Props) {
    const isEdit = Boolean(teacher);
    const { data, setData, post, put, processing, errors } = useForm({
        employee_id: teacher?.employee_id ?? '',
        first_name: teacher?.first_name ?? '',
        last_name: teacher?.last_name ?? '',
        email: teacher?.email ?? '',
        phone: teacher?.phone ?? '',
        designation: teacher?.designation ?? '',
        qualification: teacher?.qualification ?? '',
        specialization: teacher?.specialization ?? '',
        joining_date: teacher?.joining_date ?? '',
        date_of_birth: teacher?.date_of_birth ?? '',
        gender: teacher?.gender ?? '',
        address: teacher?.address ?? '',
        status: teacher?.status ?? 'active',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/teachers/${teacher!.id}`);
        } else {
            post('/teachers');
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Teacher' : 'New Teacher'}
            description={isEdit ? `Editing ${teacher!.full_name}` : 'Add a new teacher'}
            actions={
                <Button asChild variant="outline">
                    <Link href="/teachers">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Teacher' : 'New Teacher'} />

            <form onSubmit={submit} className="mx-auto max-w-4xl space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Employment</CardTitle>
                        <CardDescription>Staff identity and role</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Employee ID" error={errors.employee_id} required>
                            <Input value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)} placeholder="TCH-001" />
                        </Field>
                        <Field label="Designation" error={errors.designation}>
                            <Input value={data.designation ?? ''} onChange={(e) => setData('designation', e.target.value)} placeholder="Senior Teacher" />
                        </Field>
                        <Field label="Qualification" error={errors.qualification}>
                            <Input value={data.qualification ?? ''} onChange={(e) => setData('qualification', e.target.value)} placeholder="M.A. Education" />
                        </Field>
                        <Field label="Specialization" error={errors.specialization}>
                            <Input value={data.specialization ?? ''} onChange={(e) => setData('specialization', e.target.value)} placeholder="Mathematics" />
                        </Field>
                        <Field label="Joining Date" error={errors.joining_date}>
                            <Input type="date" value={data.joining_date ?? ''} onChange={(e) => setData('joining_date', e.target.value)} />
                        </Field>
                        <Field label="Status" error={errors.status} required>
                            <Select value={data.status} onValueChange={(v) => setData('status', v as Teacher['status'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal</CardTitle>
                        <CardDescription>Identity and contact</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="First Name" error={errors.first_name} required>
                            <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                        </Field>
                        <Field label="Last Name" error={errors.last_name} required>
                            <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                        </Field>
                        <Field label="Email" error={errors.email} required>
                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </Field>
                        <Field label="Phone" error={errors.phone}>
                            <Input value={data.phone ?? ''} onChange={(e) => setData('phone', e.target.value)} placeholder="+92 300 0000000" />
                        </Field>
                        <Field label="Date of Birth" error={errors.date_of_birth}>
                            <Input type="date" value={data.date_of_birth ?? ''} onChange={(e) => setData('date_of_birth', e.target.value)} />
                        </Field>
                        <Field label="Gender" error={errors.gender}>
                            <Select value={data.gender || '__none__'} onValueChange={(v) => setData('gender', v === '__none__' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">—</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Address" error={errors.address} className="md:col-span-2">
                            <Textarea rows={3} value={data.address ?? ''} onChange={(e) => setData('address', e.target.value)} />
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/teachers">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Teacher' : 'Create Teacher'}
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
