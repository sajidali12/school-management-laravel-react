import { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, FilePlus, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { money } from '@/lib/utils';
import type { FeeInvoice, Paginated } from '@/types';

interface Props {
    invoices: Paginated<FeeInvoice>;
    filters: { search: string; status: string | null; school_class_id: string | null };
    classes: { id: number; name: string }[];
    stats: { total: number; collected: number; pending: number; overdue_count: number };
}

const statusVariant: Record<FeeInvoice['status'], 'success' | 'info' | 'warning' | 'destructive' | 'secondary'> = {
    paid: 'success',
    partial: 'info',
    pending: 'warning',
    overdue: 'destructive',
    cancelled: 'secondary',
};

export default function Index({ invoices, filters, classes, stats }: Props) {
    const [genOpen, setGenOpen] = useState(false);
    const gen = useForm({
        school_class_id: '',
        period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10),
    });

    const apply = (patch: Record<string, string | null>) => {
        router.get('/fee-invoices', { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        apply({ search });
    };

    const generate = (e: FormEvent) => {
        e.preventDefault();
        gen.post('/fee-invoices/generate', {
            onSuccess: () => setGenOpen(false),
        });
    };

    return (
        <AppLayout
            title="Fee Challans"
            description="Generate, track and collect student fee challans"
            actions={
                <Dialog open={genOpen} onOpenChange={setGenOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <FilePlus className="mr-2 h-4 w-4" />
                            Generate Challans
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate challans for a class</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={generate} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label>Class</Label>
                                <Select value={gen.data.school_class_id} onValueChange={(v) => gen.setData('school_class_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {gen.errors.school_class_id && <p className="text-xs text-destructive">{gen.errors.school_class_id}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Period (e.g. 2026-04)</Label>
                                <Input value={gen.data.period} onChange={(e) => gen.setData('period', e.target.value)} />
                                {gen.errors.period && <p className="text-xs text-destructive">{gen.errors.period}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Issue date</Label>
                                    <Input type="date" value={gen.data.issue_date} onChange={(e) => gen.setData('issue_date', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Due date</Label>
                                    <Input type="date" value={gen.data.due_date} onChange={(e) => gen.setData('due_date', e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={gen.processing}>{gen.processing ? 'Generating...' : 'Generate'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            }
        >
            <Head title="Fee Challans" />

            <div className="grid gap-3 md:grid-cols-4">
                <StatCard label="Total billed" value={money(stats.total)} tone="indigo" />
                <StatCard label="Collected" value={money(stats.collected)} tone="emerald" />
                <StatCard label="Pending" value={money(stats.pending)} tone="amber" />
                <StatCard label="Overdue challans" value={stats.overdue_count.toString()} tone="rose" />
            </div>

            <Card className="mt-4">
                <CardHeader className="pb-0">
                    <CardTitle>Challans</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
                        <form onSubmit={onSearch} className="flex-1">
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search challan no. or student..." className="pl-9" />
                            </div>
                        </form>
                        <div className="flex flex-wrap gap-2">
                            <Select value={filters.school_class_id ?? '__all__'} onValueChange={(v) => apply({ school_class_id: v === '__all__' ? null : v })}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="Class" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All classes</SelectItem>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.status ?? '__all__'} onValueChange={(v) => apply({ status: v === '__all__' ? null : v })}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Challan No.</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Class / Section</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Due</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-16 text-right">View</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{inv.student?.first_name} {inv.student?.last_name}</div>
                                        <div className="text-xs text-muted-foreground">{inv.student?.roll_number}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{inv.student?.section?.school_class?.name}</Badge>
                                        <span className="ml-1 text-xs text-muted-foreground">{inv.student?.section?.name}</span>
                                    </TableCell>
                                    <TableCell>{inv.period}</TableCell>
                                    <TableCell>{inv.due_date}</TableCell>
                                    <TableCell className="text-right font-mono">{money(inv.total_amount)}</TableCell>
                                    <TableCell className="text-right font-mono">{money(inv.paid_amount)}</TableCell>
                                    <TableCell><Badge variant={statusVariant[inv.status]}>{inv.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                            <Link href={`/fee-invoices/${inv.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                                        No challans yet. Generate some to begin.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={invoices.links} from={invoices.from} to={invoices.to} total={invoices.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'indigo' | 'emerald' | 'amber' | 'rose' }) {
    const colors: Record<string, string> = {
        indigo: 'text-indigo-600 bg-indigo-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        amber: 'text-amber-600 bg-amber-50',
        rose: 'text-rose-600 bg-rose-50',
    };
    return (
        <Card>
            <CardContent className="p-5">
                <div className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${colors[tone]}`}>{label}</div>
                <div className="mt-2 text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
