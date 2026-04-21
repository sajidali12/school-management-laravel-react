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
import type { Account } from '@/types';

interface Props {
    account: Account | null;
}

export default function Form({ account }: Props) {
    const isEdit = Boolean(account);
    const { data, setData, post, put, processing, errors } = useForm({
        name: account?.name ?? '',
        type: account?.type ?? 'cash',
        account_number: account?.account_number ?? '',
        bank_name: account?.bank_name ?? '',
        opening_balance: account?.opening_balance ?? '0',
        is_active: account?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/accounts/${account!.id}`);
        } else {
            post('/accounts');
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Account' : 'New Account'}
            description="Bank, cash or wallet account used to receive or spend money"
            actions={
                <Button asChild variant="outline">
                    <Link href="/accounts">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Account' : 'New Account'} />

            <form onSubmit={submit} className="mx-auto max-w-xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Identify the account</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Name" error={errors.name} required className="md:col-span-2">
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Allied Bank – Main" />
                        </Field>
                        <Field label="Type" error={errors.type} required>
                            <Select value={data.type} onValueChange={(v) => setData('type', v as Account['type'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank">Bank</SelectItem>
                                    <SelectItem value="wallet">Wallet</SelectItem>
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
                        <Field label="Bank name" error={errors.bank_name}>
                            <Input value={data.bank_name ?? ''} onChange={(e) => setData('bank_name', e.target.value)} />
                        </Field>
                        <Field label="Account number" error={errors.account_number}>
                            <Input value={data.account_number ?? ''} onChange={(e) => setData('account_number', e.target.value)} />
                        </Field>
                        <Field label="Opening balance" error={errors.opening_balance} required className="md:col-span-2">
                            <Input type="number" step="0.01" min="0" value={data.opening_balance} onChange={(e) => setData('opening_balance', e.target.value)} />
                        </Field>
                    </CardContent>
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/accounts">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>{processing ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
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
