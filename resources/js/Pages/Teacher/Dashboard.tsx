import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, Layers, LogIn, Users } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initials } from '@/lib/utils';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface SectionWithClass {
    id: number;
    name: string;
    room: string | null;
    students_count: number;
    school_class?: { id: number; name: string };
}

interface Teacher {
    id: number;
    full_name: string;
    employee_id: string;
    designation: string | null;
    specialization: string | null;
    email: string;
    phone: string | null;
}

interface AttendanceRecord {
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
}

interface Stats {
    sections: number;
    subjects: number;
    students: number;
}

interface Props {
    teacher: Teacher;
    sections: SectionWithClass[];
    subjects: Subject[];
    stats: Stats;
    todayAttendance: AttendanceRecord | null;
}

function fmt(dt: string | null): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function TeacherDashboard({ teacher, sections, subjects, stats, todayAttendance }: Props) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <TeacherLayout title="Dashboard" description="Your teaching overview">
            <Head title="Teacher Dashboard" />

            <div className="space-y-6">
                {/* Welcome */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                {initials(teacher.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">{greeting}</p>
                            <h2 className="text-xl font-bold">{teacher.full_name}</h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{teacher.employee_id}</Badge>
                                {teacher.designation && <Badge variant="secondary">{teacher.designation}</Badge>}
                                {teacher.specialization && (
                                    <span className="text-xs text-muted-foreground">{teacher.specialization}</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Today's attendance status */}
                <Card className={todayAttendance ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            {todayAttendance
                                ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                : <Clock className="h-5 w-5 text-amber-600" />
                            }
                            <div>
                                <p className="text-sm font-semibold">
                                    {todayAttendance ? `Checked in at ${fmt(todayAttendance.check_in_at)}` : "You haven't checked in today"}
                                </p>
                                {todayAttendance?.check_out_at && (
                                    <p className="text-xs text-muted-foreground">Checked out at {fmt(todayAttendance.check_out_at)}</p>
                                )}
                            </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/teacher/attendance">
                                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                                {todayAttendance ? 'View' : 'Check In'}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.sections}</p>
                                <p className="text-sm text-muted-foreground">Class Sections</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.subjects}</p>
                                <p className="text-sm text-muted-foreground">Subjects Teaching</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.students}</p>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* My Sections */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">My Class Sections</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {sections.length === 0 ? (
                                <p className="px-6 pb-6 text-sm text-muted-foreground">No sections assigned yet.</p>
                            ) : (
                                <ul className="divide-y">
                                    {sections.map((s) => (
                                        <li key={s.id} className="flex items-center justify-between px-6 py-3">
                                            <div>
                                                <p className="font-medium">
                                                    {s.school_class?.name} — Section {s.name}
                                                </p>
                                                {s.room && (
                                                    <p className="text-xs text-muted-foreground">{s.room}</p>
                                                )}
                                            </div>
                                            <Badge variant="secondary">{s.students_count} students</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subjects */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Subjects I Teach</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {subjects.length === 0 ? (
                                <p className="px-6 pb-6 text-sm text-muted-foreground">No subjects assigned yet.</p>
                            ) : (
                                <ul className="divide-y">
                                    {subjects.map((sub) => (
                                        <li key={sub.id} className="flex items-center gap-3 px-6 py-3">
                                            <Badge variant="outline" className="font-mono text-xs">{sub.code}</Badge>
                                            <span className="text-sm font-medium">{sub.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TeacherLayout>
    );
}
