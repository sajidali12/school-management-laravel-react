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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Paginated, Section } from '@/types';

interface Props {
    sections: Paginated<Section>;
    filters: { search: string; school_class_id: string | null };
    classes: { id: number; name: string }[];
}

export default function Index({ sections, filters, classes }: Props) {
    const apply = (patch: Record<string, string | null>) => {
        router.get('/sections', { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        apply({ search });
    };

    return (
        <AppLayout
            title="Sections"
            description="Manage class sections"
            actions={
                <Button asChild>
                    <Link href="/sections/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Section
                    </Link>
                </Button>
            }
        >
            <Head title="Sections" />

            <Card>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
                        <form onSubmit={onSearch} className="flex-1">
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search sections..." className="pl-9" />
                            </div>
                        </form>
                        <Select
                            value={filters.school_class_id ?? '__all__'}
                            onValueChange={(v) => apply({ school_class_id: v === '__all__' ? null : v })}
                        >
                            <SelectTrigger className="w-48"><SelectValue placeholder="Class" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All classes</SelectItem>
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Class Teacher</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead className="text-center">Capacity</TableHead>
                                <TableHead className="text-center">Students</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sections.data.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell>
                                        <Badge variant="secondary">{s.school_class?.name ?? '—'}</Badge>
                                    </TableCell>
                                    <TableCell><div className="font-medium">{s.name}</div></TableCell>
                                    <TableCell>
                                        {s.class_teacher
                                            ? `${s.class_teacher.first_name} ${s.class_teacher.last_name}`
                                            : <span className="text-xs text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell>{s.room ?? <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                                    <TableCell className="text-center">{s.capacity ?? '—'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="info">{s.students_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link href={`/sections/${s.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog url={`/sections/${s.id}`} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sections.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                        No sections found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={sections.links} from={sections.from} to={sections.to} total={sections.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
