import { Head, Link, router } from '@inertiajs/react';
import { Download, Pencil, Plus } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import DeleteDialog from '@/components/DeleteDialog';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Paginated } from '@/types';

interface Section { id: number; name: string; school_class_id: number; school_class?: { name: string } }
interface Plan {
    id: number;
    title: string;
    description: string | null;
    week_start_date: string;
    file_name: string | null;
    file_url: string | null;
    section?: { id: number; name: string; school_class?: { name: string } };
    subject?: { id: number; name: string; code: string } | null;
}

interface Props {
    plans: Paginated<Plan>;
    sections: Section[];
    filters: { section_id: number | null };
}

function fmtWeek(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LessonPlansIndex({ plans, sections, filters }: Props) {
    const apply = (patch: Record<string, unknown>) =>
        router.get('/teacher/lesson-plans', { ...filters, ...patch }, { preserveState: true, replace: true });

    return (
        <TeacherLayout
            title="Lesson Plans"
            description="Create and manage your lesson plans"
            actions={
                <Button asChild size="sm">
                    <Link href="/teacher/lesson-plans/create">
                        <Plus className="mr-1.5 h-4 w-4" /> New Plan
                    </Link>
                </Button>
            }
        >
            <Head title="Lesson Plans" />

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
                                    <TableHead>Week of</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead className="w-28 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {p.section?.school_class?.name} — {p.section?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {p.subject
                                                ? <Badge variant="outline">{p.subject.code}</Badge>
                                                : <span className="text-xs text-muted-foreground">General</span>}
                                        </TableCell>
                                        <TableCell className="text-sm">{fmtWeek(p.week_start_date)}</TableCell>
                                        <TableCell>
                                            {p.file_url
                                                ? <a href={p.file_url} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                    <Download className="h-3 w-3" />{p.file_name}
                                                  </a>
                                                : <span className="text-xs text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                    <Link href={`/teacher/lesson-plans/${p.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <DeleteDialog url={`/teacher/lesson-plans/${p.id}`} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {plans.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                            No lesson plans yet. Create your first one!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Pagination links={plans.links} from={plans.from} to={plans.to} total={plans.total} />
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
