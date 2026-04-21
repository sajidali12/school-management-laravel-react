import { FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import DeleteDialog from '@/components/DeleteDialog';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FeeCategory, Paginated } from '@/types';

interface Props {
    categories: Paginated<FeeCategory>;
    filters: { search: string };
}

export default function Index({ categories, filters }: Props) {
    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        router.get('/fee-categories', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout
            title="Fee Categories"
            description="Define the different types of fees"
            actions={
                <Button asChild>
                    <Link href="/fee-categories/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Category
                    </Link>
                </Button>
            }
        >
            <Head title="Fee Categories" />

            <Card>
                <CardContent className="p-0">
                    <div className="border-b p-4">
                        <form onSubmit={onSearch}>
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search..." className="pl-9" />
                            </div>
                        </form>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead className="text-center">Classes</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell>
                                        <div className="font-medium">{c.name}</div>
                                        {c.description && <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{c.frequency.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{c.structures_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={c.is_active ? 'success' : 'secondary'}>{c.is_active ? 'active' : 'inactive'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link href={`/fee-categories/${c.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog url={`/fee-categories/${c.id}`} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                        No fee categories yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={categories.links} from={categories.from} to={categories.to} total={categories.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
