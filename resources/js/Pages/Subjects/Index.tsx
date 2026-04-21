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
import type { Paginated, Subject } from '@/types';

interface Props {
    subjects: Paginated<Subject>;
    filters: { search: string };
}

export default function Index({ subjects, filters }: Props) {
    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        router.get('/subjects', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout
            title="Subjects"
            description="Curriculum subjects"
            actions={
                <Button asChild>
                    <Link href="/subjects/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Subject
                    </Link>
                </Button>
            }
        >
            <Head title="Subjects" />

            <Card>
                <CardContent className="p-0">
                    <div className="border-b p-4">
                        <form onSubmit={onSearch}>
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search subjects..." className="pl-9" />
                            </div>
                        </form>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-center">Classes</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.data.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell><Badge variant="outline">{s.code}</Badge></TableCell>
                                    <TableCell>
                                        <div className="font-medium">{s.name}</div>
                                        {s.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="info">{s.classes_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={s.is_active ? 'success' : 'secondary'}>{s.is_active ? 'active' : 'inactive'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link href={`/subjects/${s.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog url={`/subjects/${s.id}`} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {subjects.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                        No subjects found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={subjects.links} from={subjects.from} to={subjects.to} total={subjects.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
