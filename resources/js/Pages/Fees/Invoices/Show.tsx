import { FormEvent, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { money } from '@/lib/utils';
import type { FeeInvoice } from '@/types';

interface School {
    name: string;
    logo_url: string | null;
    tagline: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    registration_number: string | null;
    currency: string;
}

interface Props {
    invoice: FeeInvoice;
    accounts: { id: number; name: string }[];
    school: School;
}

const statusVariant: Record<FeeInvoice['status'], 'success' | 'info' | 'warning' | 'destructive' | 'secondary'> = {
    paid: 'success',
    partial: 'info',
    pending: 'warning',
    overdue: 'destructive',
    cancelled: 'secondary',
};

export default function Show({ invoice, accounts, school }: Props) {
    const [open, setOpen] = useState(false);
    const due = Number(invoice.total_amount) - Number(invoice.paid_amount);
    const pay = useForm({
        amount: due > 0 ? due.toFixed(2) : '0',
        payment_date: new Date().toISOString().slice(0, 10),
        method: 'cash',
        reference: '',
        account_id: '',
        notes: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        pay.post(`/fee-invoices/${invoice.id}/payment`, {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <AppLayout
            title={`Challan No. ${invoice.invoice_number}`}
            description={`${invoice.student?.first_name} ${invoice.student?.last_name} • ${invoice.period ?? ''}`}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/fee-invoices">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title={`Challan No. ${invoice.invoice_number}`} />

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #fee-challan, #fee-challan * { visibility: visible; }
                    #fee-challan { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card id="fee-challan" className="lg:col-span-2">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between border-b pb-4">
                            <div className="flex items-start gap-4">
                                {school.logo_url ? (
                                    <img src={school.logo_url} alt={school.name} className="h-16 w-16 rounded-md object-cover" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary/10 text-xl font-bold text-primary">
                                        {school.name.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="text-xl font-bold leading-tight">{school.name}</div>
                                    {school.tagline && <div className="text-xs italic text-muted-foreground">{school.tagline}</div>}
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {[school.address, school.city].filter(Boolean).join(', ')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {[school.phone, school.email, school.website].filter(Boolean).join(' • ')}
                                    </div>
                                    {school.registration_number && (
                                        <div className="text-[10px] text-muted-foreground">Reg: {school.registration_number}</div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold uppercase tracking-wider text-primary">Fee Challan</div>
                                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Challan No.</div>
                                <div className="font-mono text-sm font-semibold">{invoice.invoice_number}</div>
                                <div className="mt-2"><Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge></div>
                            </div>
                        </div>

                        <div className="grid gap-4 pt-4 md:grid-cols-2">
                            <Info label="Student" value={`${invoice.student?.first_name} ${invoice.student?.last_name}`} />
                            <Info label="Roll #" value={invoice.student?.roll_number ?? '—'} />
                            <Info label="Class / Section" value={`${invoice.student?.section?.school_class?.name ?? '—'} / ${invoice.student?.section?.name ?? '—'}`} />
                            <Info label="Guardian" value={invoice.student?.guardian_name ?? '—'} />
                            <Info label="Issue date" value={invoice.issue_date} />
                            <Info label="Due date" value={invoice.due_date} />
                            <Info label="Period" value={invoice.period ?? '—'} />
                        </div>

                        <Table className="mt-6">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right font-mono">{money(item.amount)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell className="font-semibold">Total</TableCell>
                                    <TableCell className="text-right font-mono font-semibold">{money(invoice.total_amount)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Paid</TableCell>
                                    <TableCell className="text-right font-mono text-emerald-700">{money(invoice.paid_amount)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Balance</TableCell>
                                    <TableCell className="text-right font-mono font-semibold text-rose-700">{money(due)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="no-print">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Payments</CardTitle>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" disabled={due <= 0}>Record payment</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Record payment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submit} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldRow label="Amount" error={pay.errors.amount}>
                                            <Input type="number" step="0.01" value={pay.data.amount} onChange={(e) => pay.setData('amount', e.target.value)} />
                                        </FieldRow>
                                        <FieldRow label="Date" error={pay.errors.payment_date}>
                                            <Input type="date" value={pay.data.payment_date} onChange={(e) => pay.setData('payment_date', e.target.value)} />
                                        </FieldRow>
                                        <FieldRow label="Method" error={pay.errors.method}>
                                            <Select value={pay.data.method} onValueChange={(v) => pay.setData('method', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="cheque">Cheque</SelectItem>
                                                    <SelectItem value="card">Card</SelectItem>
                                                    <SelectItem value="online">Online</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FieldRow>
                                        <FieldRow label="Account" error={pay.errors.account_id}>
                                            <Select value={pay.data.account_id || '__none__'} onValueChange={(v) => pay.setData('account_id', v === '__none__' ? '' : v)}>
                                                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__none__">— (no posting)</SelectItem>
                                                    {accounts.map((a) => (
                                                        <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldRow>
                                    </div>
                                    <FieldRow label="Reference" error={pay.errors.reference}>
                                        <Input value={pay.data.reference} onChange={(e) => pay.setData('reference', e.target.value)} placeholder="Cheque # / Txn ID" />
                                    </FieldRow>
                                    <FieldRow label="Notes" error={pay.errors.notes}>
                                        <Textarea rows={2} value={pay.data.notes} onChange={(e) => pay.setData('notes', e.target.value)} />
                                    </FieldRow>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={pay.processing}>{pay.processing ? 'Saving...' : 'Save payment'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {(invoice.payments?.length ?? 0) === 0 ? (
                            <p className="text-sm text-muted-foreground">No payments recorded.</p>
                        ) : (
                            <div className="space-y-2">
                                {invoice.payments?.map((p) => (
                                    <div key={p.id} className="rounded-md border p-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">{money(p.amount)}</div>
                                            <Badge variant="outline">{p.method.replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {p.payment_date}{p.account ? ` • ${p.account.name}` : ''}{p.reference ? ` • ${p.reference}` : ''}
                                        </div>
                                        {p.notes && <div className="mt-1 text-xs">{p.notes}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-0.5 text-sm font-medium">{value}</div>
        </div>
    );
}

function FieldRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
