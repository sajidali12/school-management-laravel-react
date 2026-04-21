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
import type { Paginated, SchoolClass } from '@/types';

interface Props {
    classes: Paginated<SchoolClass>;
    filters: { search: string };
}

export default function Index({ classes, filters }: Props) {
    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        router.get('/classes', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout
            title="Classes"
            description="Manage grade levels and classes"
            actions={
                <Button asChild>
                    <Link href="/classes/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Class
                    </Link>
                </Button>
            }
        >
            <Head title="Classes" />

            <Card>
                <CardContent className="p-0">
                    <div className="border-b p-4">
                        <form onSubmit={onSearch}>
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search classes..." className="pl-9" />
                            </div>
                        </form>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-center">Level</TableHead>
                                <TableHead className="text-center">Sections</TableHead>
                                <TableHead className="text-center">Subjects</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.data.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell>
                                        <div className="font-medium">{c.name}</div>
                                        {c.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {c.level != null ? <Badge variant="outline">Grade {c.level}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="info">{c.sections_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{c.subjects_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link href={`/classes/${c.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog url={`/classes/${c.id}`} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {classes.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                        No classes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={classes.links} from={classes.from} to={classes.to} total={classes.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
