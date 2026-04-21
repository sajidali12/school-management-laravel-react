import { Head, Link } from '@inertiajs/react';
import { Banknote, Pencil, Plus, Wallet as WalletIcon } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import DeleteDialog from '@/components/DeleteDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { money } from '@/lib/utils';
import type { Account } from '@/types';

interface Props {
    accounts: Account[];
}

export default function Index({ accounts }: Props) {
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.current_balance ?? 0), 0);

    return (
        <AppLayout
            title="Accounts"
            description="Bank, cash and wallet accounts"
            actions={
                <Button asChild>
                    <Link href="/accounts/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Account
                    </Link>
                </Button>
            }
        >
            <Head title="Accounts" />

            <Card className="mb-4">
                <CardContent className="flex items-center justify-between p-5">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Total available balance</div>
                        <div className="mt-1 text-3xl font-bold">{money(totalBalance)}</div>
                    </div>
                    <Banknote className="h-10 w-10 text-primary" />
                </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((a) => (
                    <Card key={a.id}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <WalletIcon className="h-5 w-5 text-primary" />
                                {a.name}
                            </CardTitle>
                            <div className="flex gap-1">
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                    <Link href={`/accounts/${a.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <DeleteDialog url={`/accounts/${a.id}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 text-xs">
                                <Badge variant="outline">{a.type}</Badge>
                                {!a.is_active && <Badge variant="secondary">inactive</Badge>}
                            </div>
                            {a.bank_name && <div className="mt-2 text-sm text-muted-foreground">{a.bank_name}</div>}
                            {a.account_number && <div className="text-xs font-mono text-muted-foreground">{a.account_number}</div>}
                            <div className="mt-3 text-2xl font-bold">{money(a.current_balance)}</div>
                            <div className="text-xs text-muted-foreground">Opening: {money(a.opening_balance)}</div>
                        </CardContent>
                    </Card>
                ))}
                {accounts.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            No accounts yet. <Link href="/accounts/create" className="text-primary underline">Add one</Link>.
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
