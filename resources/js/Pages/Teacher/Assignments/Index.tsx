import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Download, Pencil, Plus, Users } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import DeleteDialog from '@/components/DeleteDialog';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Paginated } from '@/types';

interface Section { id: number; name: string; school_class?: { name: string } }
interface Assignment {
    id: number; title: string; due_date: string; total_marks: string | null;
    file_name: string | null; file_url: string | null;
    submissions_count: number;
    section?: { name: string; school_class?: { name: string } };
    subject?: { code: string; name: string } | null;
}

interface Props {
    assignments: Paginated<Assignment>;
    sections: Section[];
    filters: { section_id: number | null };
}

function dueVariant(due: string): 'destructive' | 'warning' | 'secondary' {
    const diff = new Date(due).getTime() - Date.now();
    if (diff < 0) return 'destructive';
    if (diff < 86400000 * 2) return 'warning';
    return 'secondary';
}

function fmtDue(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AssignmentsIndex({ assignments, sections, filters }: Props) {
    const apply = (patch: Record<string, unknown>) =>
        router.get('/teacher/assignments', { ...filters, ...patch }, { preserveState: true, replace: true });

    return (
        <TeacherLayout
            title="Assignments"
            description="Create and manage assignments for your sections"
            actions={
                <Button asChild size="sm">
                    <Link href="/teacher/assignments/create">
                        <Plus className="mr-1.5 h-4 w-4" /> New Assignment
                    </Link>
                </Button>
            }
        >
            <Head title="Assignments" />

            <div className="space-y-4">
                <div className="flex gap-3">
                    <Select
                        value={filters.section_id ? String(filters.section_id) : '__all__'}
                        onValueChange={(v) => apply({ section_id: v === '__all__' ? null : v })}
                    >
                        <SelectTrigger className="w-56"><SelectValue placeholder="All Sections" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Sections</SelectItem>
                            {sections.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                    {s.school_class?.name} — {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="w-32 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.data.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell>
                                            <div className="font-medium">{a.title}</div>
                                            {a.file_url && (
                                                <a href={a.file_url} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline mt-0.5">
                                                    <Download className="h-3 w-3" />{a.file_name}
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{a.section?.school_class?.name} — {a.section?.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {a.subject ? <Badge variant="outline">{a.subject.code}</Badge>
                                                : <span className="text-xs text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={dueVariant(a.due_date)} className="text-xs">{fmtDue(a.due_date)}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{a.total_marks ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{a.submissions_count}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View submissions">
                                                    <Link href={`/teacher/assignments/${a.id}/submissions`}>
                                                        <Users className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                    <Link href={`/teacher/assignments/${a.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <DeleteDialog url={`/teacher/assignments/${a.id}`} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {assignments.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                            No assignments yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Pagination links={assignments.links} from={assignments.from} to={assignments.to} total={assignments.total} />
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
