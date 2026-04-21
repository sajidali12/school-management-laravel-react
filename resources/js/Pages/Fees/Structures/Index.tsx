import { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { money } from '@/lib/utils';
import type { FeeStructure } from '@/types';

interface Props {
    classes: { id: number; name: string }[];
    selectedClassId: number | null;
    structures: FeeStructure[];
    categories: { id: number; name: string; frequency: string }[];
}

export default function Index({ classes, selectedClassId, structures, categories }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        school_class_id: selectedClassId ?? '',
        fee_category_id: '',
        amount: '',
    });

    const onClassChange = (id: string) => {
        router.get('/fee-structures', { school_class_id: id }, { preserveState: false });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/fee-structures', {
            onSuccess: () => {
                reset('fee_category_id', 'amount');
                setShowForm(false);
            },
        });
    };

    const remove = (id: number) => {
        if (confirm('Remove this fee from the structure?')) {
            router.delete(`/fee-structures/${id}`, { preserveScroll: true });
        }
    };

    const total = structures.reduce((sum, s) => sum + Number(s.amount), 0);
    const assignedIds = new Set(structures.map((s) => s.fee_category_id));
    const availableCategories = categories.filter((c) => !assignedIds.has(c.id));

    return (
        <AppLayout
            title="Fee Structure"
            description="Amounts charged per class for each fee category"
        >
            <Head title="Fee Structure" />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Class</CardTitle>
                        <CardDescription>Select a class to configure its fee structure</CardDescription>
                    </div>
                    <Select value={selectedClassId ? String(selectedClassId) : ''} onValueChange={onClassChange}>
                        <SelectTrigger className="w-56"><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {!selectedClassId ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Pick a class to begin.</p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fee Category</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="w-16 text-right">Remove</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {structures.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.fee_category?.name}</TableCell>
                                            <TableCell><Badge variant="outline">{s.fee_category?.frequency.replace('_', ' ')}</Badge></TableCell>
                                            <TableCell className="text-right font-mono">{money(s.amount)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(s.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {structures.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                                No fees assigned to this class yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {structures.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="font-semibold">Total per period</TableCell>
                                            <TableCell className="text-right font-mono font-semibold">{money(total)}</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {!showForm ? (
                                <div className="mt-4">
                                    <Button onClick={() => setShowForm(true)} disabled={availableCategories.length === 0}>
                                        Add fee to class
                                    </Button>
                                    {availableCategories.length === 0 && (
                                        <p className="mt-2 text-xs text-muted-foreground">All categories assigned to this class.</p>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={submit} className="mt-4 grid gap-3 rounded-md border p-4 md:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label>Category</Label>
                                        <Select value={data.fee_category_id} onValueChange={(v) => setData('fee_category_id', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                {availableCategories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.fee_category_id && <p className="text-xs text-destructive">{errors.fee_category_id}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Amount</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                        />
                                        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <Button type="submit" disabled={processing}>Save</Button>
                                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
