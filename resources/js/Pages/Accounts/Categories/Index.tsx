import { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { ExpenseCategory } from '@/types';

interface Props {
    categories: ExpenseCategory[];
}

export default function Index({ categories }: Props) {
    const [editing, setEditing] = useState<ExpenseCategory | null>(null);
    const [creating, setCreating] = useState(false);
    const form = useForm({ name: '', description: '' });

    const open = (c: ExpenseCategory | null) => {
        setEditing(c);
        setCreating(!c);
        form.setData({ name: c?.name ?? '', description: c?.description ?? '' });
        form.clearErrors();
    };

    const close = () => {
        setEditing(null);
        setCreating(false);
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.patch(`/expense-categories/${editing.id}`, { onSuccess: close });
        } else {
            form.post('/expense-categories', { onSuccess: close });
        }
    };

    const remove = (c: ExpenseCategory) => {
        if (confirm(`Delete "${c.name}"?`)) {
            router.delete(`/expense-categories/${c.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout
            title="Expense Categories"
            description="Buckets for expense transactions (salaries, utilities, supplies...)"
            actions={
                <Button onClick={() => open(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            }
        >
            <Head title="Expense Categories" />

            {(creating || editing) && (
                <Card className="mb-4">
                    <CardContent className="p-4">
                        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label>Name</Label>
                                <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea rows={2} value={form.data.description ?? ''} onChange={(e) => form.setData('description', e.target.value)} />
                            </div>
                            <div className="md:col-span-3 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{c.description ?? '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => open(c)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(c)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                                        No categories yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
