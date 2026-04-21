import { FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import DeleteDialog from '@/components/DeleteDialog';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { money } from '@/lib/utils';
import type { Paginated, Transaction } from '@/types';

interface Props {
    transactions: Paginated<Transaction>;
    filters: {
        search: string;
        type: string | null;
        account_id: string | null;
        from: string | null;
        to: string | null;
    };
    accounts: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    summary: { income: number; expense: number; balance: number };
}

export default function Index({ transactions, filters, accounts, summary }: Props) {
    const apply = (patch: Record<string, string | null>) => {
        router.get('/transactions', { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        apply({ search });
    };

    return (
        <AppLayout
            title="Transactions"
            description="All money in and out, across every account"
            actions={
                <Button asChild>
                    <Link href="/transactions/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Transaction
                    </Link>
                </Button>
            }
        >
            <Head title="Transactions" />

            <div className="grid gap-3 md:grid-cols-3">
                <StatCard label="Total income" value={money(summary.income)} tone="emerald" />
                <StatCard label="Total expense" value={money(summary.expense)} tone="rose" />
                <StatCard label="Net balance" value={money(summary.balance)} tone="indigo" />
            </div>

            <Card className="mt-4">
                <CardHeader className="pb-0">
                    <CardTitle>Ledger</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
                        <form onSubmit={onSearch} className="flex-1">
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search description or reference..." className="pl-9" />
                            </div>
                        </form>
                        <div className="flex flex-wrap gap-2">
                            <Input
                                type="date"
                                value={filters.from ?? ''}
                                onChange={(e) => apply({ from: e.target.value || null })}
                                className="w-40"
                            />
                            <Input
                                type="date"
                                value={filters.to ?? ''}
                                onChange={(e) => apply({ to: e.target.value || null })}
                                className="w-40"
                            />
                            <Select value={filters.type ?? '__all__'} onValueChange={(v) => apply({ type: v === '__all__' ? null : v })}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All types</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.account_id ?? '__all__'} onValueChange={(v) => apply({ account_id: v === '__all__' ? null : v })}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="Account" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All accounts</SelectItem>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="text-sm">{t.date}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{t.description}</div>
                                        {t.reference && <div className="text-xs text-muted-foreground">{t.reference}</div>}
                                    </TableCell>
                                    <TableCell className="text-sm">{t.account?.name ?? '—'}</TableCell>
                                    <TableCell className="text-sm">{t.expense_category?.name ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.type === 'income' ? 'success' : t.type === 'expense' ? 'destructive' : 'secondary'}>
                                            {t.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-mono ${t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {t.type === 'expense' ? '-' : '+'}{money(t.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {!t.source_type && (
                                                <>
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                        <Link href={`/transactions/${t.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <DeleteDialog url={`/transactions/${t.id}`} />
                                                </>
                                            )}
                                            {t.source_type && <span className="text-xs text-muted-foreground">linked</span>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                        No transactions recorded.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={transactions.links} from={transactions.from} to={transactions.to} total={transactions.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'rose' | 'indigo' }) {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-600 bg-emerald-50',
        rose: 'text-rose-600 bg-rose-50',
        indigo: 'text-indigo-600 bg-indigo-50',
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
