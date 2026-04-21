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
import type { Transaction } from '@/types';

interface Props {
    transaction: Transaction | null;
    accounts: { id: number; name: string }[];
    categories: { id: number; name: string }[];
}

export default function Form({ transaction, accounts, categories }: Props) {
    const isEdit = Boolean(transaction);
    const { data, setData, post, put, processing, errors } = useForm({
        account_id: transaction?.account_id ? String(transaction.account_id) : '',
        expense_category_id: transaction?.expense_category_id ? String(transaction.expense_category_id) : '',
        type: transaction?.type ?? 'expense',
        amount: transaction?.amount ?? '',
        date: transaction?.date ?? new Date().toISOString().slice(0, 10),
        description: transaction?.description ?? '',
        reference: transaction?.reference ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/transactions/${transaction!.id}`);
        } else {
            post('/transactions');
        }
    };

    return (
        <AppLayout
            title={isEdit ? 'Edit Transaction' : 'New Transaction'}
            description="Record money coming in or going out"
            actions={
                <Button asChild variant="outline">
                    <Link href="/transactions">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            }
        >
            <Head title={isEdit ? 'Edit Transaction' : 'New Transaction'} />

            <form onSubmit={submit} className="mx-auto max-w-xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Fill in the transaction information</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Type" error={errors.type} required>
                            <Select value={data.type} onValueChange={(v) => setData('type', v as 'income' | 'expense')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Date" error={errors.date} required>
                            <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                        </Field>
                        <Field label="Account" error={errors.account_id} required className="md:col-span-2">
                            <Select value={data.account_id} onValueChange={(v) => setData('account_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                                <SelectContent>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        {data.type === 'expense' && (
                            <Field label="Expense category" error={errors.expense_category_id} className="md:col-span-2">
                                <Select
                                    value={data.expense_category_id || '__none__'}
                                    onValueChange={(v) => setData('expense_category_id', v === '__none__' ? '' : v)}
                                >
                                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">—</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                        <Field label="Amount" error={errors.amount} required>
                            <Input type="number" step="0.01" min="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                        </Field>
                        <Field label="Reference" error={errors.reference}>
                            <Input value={data.reference ?? ''} onChange={(e) => setData('reference', e.target.value)} placeholder="Receipt # / Txn ID" />
                        </Field>
                        <Field label="Description" error={errors.description} required className="md:col-span-2">
                            <Textarea rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </Field>
                    </CardContent>
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/transactions">Cancel</Link>
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
