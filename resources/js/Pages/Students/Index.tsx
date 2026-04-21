import { FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import DeleteDialog from '@/components/DeleteDialog';
import Pagination from '@/components/Pagination';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { initials } from '@/lib/utils';
import type { Paginated, Student } from '@/types';

interface Props {
    students: Paginated<Student>;
    filters: {
        search: string;
        school_class_id: string | null;
        section_id: string | null;
        status: string | null;
    };
    classes: { id: number; name: string }[];
    sections: { id: number; name: string; school_class_id: number; school_class?: { id: number; name: string } }[];
}

const statusVariant: Record<Student['status'], 'success' | 'info' | 'warning' | 'destructive'> = {
    active: 'success',
    graduated: 'info',
    transferred: 'warning',
    dropped: 'destructive',
};

export default function Index({ students, filters, classes, sections }: Props) {
    const apply = (patch: Record<string, string | null>) => {
        router.get('/students', { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        apply({ search });
    };

    const filteredSections = filters.school_class_id
        ? sections.filter((s) => s.school_class_id === Number(filters.school_class_id))
        : sections;

    return (
        <AppLayout
            title="Students"
            description="Manage enrolled students"
            actions={
                <Button asChild>
                    <Link href="/students/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Student
                    </Link>
                </Button>
            }
        >
            <Head title="Students" />

            <Card>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
                        <form onSubmit={onSearch} className="flex-1">
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search students..." className="pl-9" />
                            </div>
                        </form>
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={filters.school_class_id ?? '__all__'}
                                onValueChange={(v) => apply({ school_class_id: v === '__all__' ? null : v, section_id: null })}
                            >
                                <SelectTrigger className="w-44"><SelectValue placeholder="Class" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All classes</SelectItem>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.section_id ?? '__all__'}
                                onValueChange={(v) => apply({ section_id: v === '__all__' ? null : v })}
                            >
                                <SelectTrigger className="w-40"><SelectValue placeholder="Section" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All sections</SelectItem>
                                    {filteredSections.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.school_class?.name ? `${s.school_class.name} - ${s.name}` : s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status ?? '__all__'}
                                onValueChange={(v) => apply({ status: v === '__all__' ? null : v })}
                            >
                                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                    <SelectItem value="transferred">Transferred</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Roll No.</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                    {initials(s.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{s.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{s.email ?? s.phone ?? '—'}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{s.roll_number}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{s.section?.school_class?.name ?? '—'}</Badge>
                                    </TableCell>
                                    <TableCell>{s.section?.name ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link href={`/students/${s.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog url={`/students/${s.id}`} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {students.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={students.links} from={students.from} to={students.to} total={students.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
