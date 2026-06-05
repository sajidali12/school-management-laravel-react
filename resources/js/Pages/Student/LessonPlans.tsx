import { Head, router } from '@inertiajs/react';
import { BookOpen, Download } from 'lucide-react';
import StudentLayout from '@/Layouts/StudentLayout';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Paginated } from '@/types';

interface Subject { id: number; name: string; code: string }
interface Plan {
    id: number; title: string; description: string | null;
    week_start_date: string; file_name: string | null; file_url: string | null;
    subject?: { name: string; code: string } | null;
    teacher?: { full_name: string };
}

interface Props {
    plans: Paginated<Plan>;
    subjects: Subject[];
    filters: { subject_id: number | null };
}

function fmtWeek(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function StudentLessonPlans({ plans, subjects, filters }: Props) {
    const apply = (patch: Record<string, unknown>) =>
        router.get('/student/lesson-plans', { ...filters, ...patch }, { preserveState: true, replace: true });

    return (
        <StudentLayout title="Lesson Plans" description="View lesson plans shared by your teachers">
            <Head title="Lesson Plans" />

            <div className="space-y-4">
                <div className="flex gap-3">
                    <Select
                        value={filters.subject_id ? String(filters.subject_id) : '__all__'}
                        onValueChange={(v) => apply({ subject_id: v === '__all__' ? null : v })}
                    >
                        <SelectTrigger className="w-48"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Subjects</SelectItem>
                            {subjects.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.code} — {s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {plans.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center text-sm text-muted-foreground">
                            No lesson plans available yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {plans.data.map((p) => (
                            <Card key={p.id}>
                                <CardContent className="flex items-start gap-4 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">{p.title}</h3>
                                            {p.subject && <Badge variant="outline" className="text-xs">{p.subject.code}</Badge>}
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Week of {fmtWeek(p.week_start_date)}
                                            {p.teacher && <> · By {p.teacher.full_name}</>}
                                        </p>
                                        {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                                        {p.file_url && (
                                            <a
                                                href={p.file_url} target="_blank" rel="noreferrer"
                                                className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                {p.file_name}
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Pagination links={plans.links} from={plans.from} to={plans.to} total={plans.total} />
            </div>
        </StudentLayout>
    );
}
