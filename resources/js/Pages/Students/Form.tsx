import { FormEvent, useMemo } from 'react';
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
import type { Student } from '@/types';

interface SectionOption {
    id: number;
    name: string;
    school_class_id: number;
    school_class?: { id: number; name: string };
}

interface Props {
    student: Student | null;
    sections: SectionOption[];
}

export default function Form({ student, sections }: Props) {
    const isEdit = Boolean(student);
    const currentYear = new Date().getFullYear();
    const { data, setData, post, put, processing, errors } = useForm({
        section_id: student?.section_id ? String(student.section_id) : '',
        roll_number: student?.roll_number ?? '',
        first_name: student?.first_name ?? '',
        last_name: student?.last_name ?? '',
        email: student?.email ?? '',
        phone: student?.phone ?? '',
        date_of_birth: student?.date_of_birth ?? '',
        gender: student?.gender ?? '',
        guardian_name: student?.guardian_name ?? '',
        guardian_phone: student?.guardian_phone ?? '',
        address: student?.address ?? '',
        admission_year: student?.admission_year ?? currentYear,
        status: student?.status ?? 'active',
    });

    const sectionsByClass = useMemo(() => {
        const m = new Map<string, SectionOption[]>();
        for (const s of sections) {
            const key = s.school_class?.name ?? '—';
            if (!m.has(key)) m.set(key, []);
            m.get(key)!.push(s);
        }
        return m;
    }, [sections]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/students/${student!.id}`);
        } else {
            post('/students');
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Student' : 'New Student'}
            description={isEdit ? `Editing ${student!.full_name}` : 'Enroll a new student'}
            actions={
                <Button asChild variant="outline">
                    <Link href="/students">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Student' : 'New Student'} />

            <form onSubmit={submit} className="mx-auto max-w-4xl space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment</CardTitle>
                        <CardDescription>Section and admission details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Section" error={errors.section_id} required>
                            <Select value={data.section_id} onValueChange={(v) => setData('section_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                                <SelectContent>
                                    {[...sectionsByClass.entries()].map(([className, opts]) => (
                                        <div key={className}>
                                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">{className}</div>
                                            {opts.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {className} - {s.name}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Roll Number" error={errors.roll_number} required>
                            <Input value={data.roll_number} onChange={(e) => setData('roll_number', e.target.value)} placeholder="2024-001" />
                        </Field>
                        <Field label="Admission Year" error={errors.admission_year}>
                            <Input
                                type="number"
                                min={1990}
                                max={currentYear + 1}
                                value={data.admission_year ?? ''}
                                onChange={(e) => setData('admission_year', e.target.value === '' ? (null as unknown as number) : Number(e.target.value))}
                            />
                        </Field>
                        <Field label="Status" error={errors.status} required>
                            <Select value={data.status} onValueChange={(v) => setData('status', v as Student['status'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                    <SelectItem value="transferred">Transferred</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal</CardTitle>
                        <CardDescription>Student identity and contact</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="First Name" error={errors.first_name} required>
                            <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                        </Field>
                        <Field label="Last Name" error={errors.last_name} required>
                            <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                        </Field>
                        <Field label="Email" error={errors.email}>
                            <Input type="email" value={data.email ?? ''} onChange={(e) => setData('email', e.target.value)} />
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
                        <Field label="Guardian Name" error={errors.guardian_name}>
                            <Input value={data.guardian_name ?? ''} onChange={(e) => setData('guardian_name', e.target.value)} />
                        </Field>
                        <Field label="Guardian Phone" error={errors.guardian_phone}>
                            <Input value={data.guardian_phone ?? ''} onChange={(e) => setData('guardian_phone', e.target.value)} />
                        </Field>
                        <Field label="Address" error={errors.address} className="md:col-span-2">
                            <Textarea rows={3} value={data.address ?? ''} onChange={(e) => setData('address', e.target.value)} />
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/students">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Student' : 'Create Student'}
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
