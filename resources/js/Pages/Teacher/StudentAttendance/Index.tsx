import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, Clock } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Section {
    id: number;
    name: string;
    students_count: number;
    school_class?: { id: number; name: string };
}

interface Session {
    section_id: number;
    date: string;
    records: { status: string }[];
}

interface Props {
    sections: Section[];
    todaySessions: Session[];
    today: string;
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function StudentAttendanceIndex({ sections, todaySessions, today }: Props) {
    const sessionMap = Object.fromEntries(todaySessions.map((s) => [s.section_id, s]));

    return (
        <TeacherLayout title="Student Attendance" description="Mark and manage student attendance for your sections">
            <Head title="Student Attendance" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Today — {fmtDate(today)}</p>
                    </div>
                </div>

                {sections.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center text-sm text-muted-foreground">
                            No sections assigned to you yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sections.map((section) => {
                            const session = sessionMap[section.id] ?? null;
                            const present = session?.records.filter((r) => r.status === 'present').length ?? 0;
                            const taken = !!session;

                            return (
                                <Card key={section.id} className={taken ? 'border-emerald-200' : ''}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center justify-between text-base">
                                            <span>
                                                {section.school_class?.name} — {section.name}
                                            </span>
                                            {taken
                                                ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                : <Clock className="h-4 w-4 text-muted-foreground" />
                                            }
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{section.students_count} students</span>
                                            {taken && (
                                                <>
                                                    <span>·</span>
                                                    <span className="text-emerald-600 font-medium">{present} present</span>
                                                    <span>·</span>
                                                    <span className="text-rose-500 font-medium">
                                                        {(session?.records.length ?? 0) - present} absent
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button asChild size="sm" variant={taken ? 'outline' : 'default'} className="flex-1">
                                                <Link href={`/teacher/student-attendance/take?section_id=${section.id}&date=${today}`}>
                                                    <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                                                    {taken ? 'Edit Attendance' : 'Take Attendance'}
                                                </Link>
                                            </Button>
                                        </div>

                                        {!taken && (
                                            <p className="text-xs text-amber-600">Attendance not taken today</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
