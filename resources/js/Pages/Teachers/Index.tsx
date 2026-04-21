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
import type { Paginated, Teacher } from '@/types';

interface Props {
    teachers: Paginated<Teacher>;
    filters: { search: string; status: string | null };
}

const statusVariant: Record<Teacher['status'], 'success' | 'warning' | 'secondary'> = {
    active: 'success',
    on_leave: 'warning',
    inactive: 'secondary',
};

export default function Index({ teachers, filters }: Props) {
    const apply = (patch: Record<string, string | null>) => {
        router.get('/teachers', { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const search = (new FormData(e.currentTarget).get('search') as string) ?? '';
        apply({ search });
    };

    return (
        <AppLayout
            title="Teachers"
            description="Manage teaching staff"
            actions={
                <Button asChild>
                    <Link href="/teachers/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Teacher
                    </Link>
                </Button>
            }
        >
            <Head title="Teachers" />

            <Card>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
                        <form onSubmit={onSearch} className="flex-1">
                            <div className="relative max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="search" defaultValue={filters.search} placeholder="Search teachers..." className="pl-9" />
                            </div>
                        </form>
                        <Select
                            value={filters.status ?? '__all__'}
                            onValueChange={(v) => apply({ status: v === '__all__' ? null : v })}
                        >
                            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on_leave">On Leave</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.data.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                                                    {initials(t.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{t.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{t.specialization ?? ''}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{t.employee_id}</Badge></TableCell>
                                    <TableCell>{t.designation || <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">{t.email}</div>
                                        <div className="text-xs text-muted-foreground">{t.phone ?? ''}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[t.status]}>{t.status.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link href={`/teachers/${t.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog url={`/teachers/${t.id}`} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {teachers.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                        No teachers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination links={teachers.links} from={teachers.from} to={teachers.to} total={teachers.total} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
