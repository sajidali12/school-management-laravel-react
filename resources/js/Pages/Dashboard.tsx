import { Head, Link } from '@inertiajs/react';
import { BookOpen, Layers, School, TrendingUp, UserSquare2, Users } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';
import type { Student } from '@/types';

interface DashboardProps {
    stats: {
        classes: number;
        sections: number;
        teachers: { active: number; total: number };
        students: { active: number; total: number };
        subjects: { active: number; total: number };
    };
    admissionTrend: { year: string; total: number }[];
    recentStudents: Student[];
    classBreakdown: {
        id: number;
        name: string;
        sections_count: number;
        students_count: number;
    }[];
}

export default function Dashboard({ stats, admissionTrend, recentStudents, classBreakdown }: DashboardProps) {
    const maxTrend = Math.max(...admissionTrend.map((p) => p.total), 1);
    const statCards = [
        { label: 'Classes', value: stats.classes, hint: 'Grade levels', icon: School, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Sections', value: stats.sections, hint: 'Active sections', icon: Layers, color: 'text-purple-600 bg-purple-50' },
        { label: 'Students', value: stats.students.active, hint: `${stats.students.total} total enrolled`, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Teachers', value: stats.teachers.active, hint: `${stats.teachers.total} on staff`, icon: UserSquare2, color: 'text-sky-600 bg-sky-50' },
        { label: 'Subjects', value: stats.subjects.active, hint: `${stats.subjects.total} offered`, icon: BookOpen, color: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <AppLayout title="Dashboard" description="Overview of your institution at a glance">
            <Head title="Dashboard" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {statCards.map(({ label, value, hint, icon: Icon, color }) => (
                    <Card key={label}>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold leading-none">{value.toLocaleString()}</div>
                                <div className="mt-1 text-sm font-medium text-muted-foreground">{label}</div>
                                <div className="text-xs text-muted-foreground">{hint}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Admissions Trend
                        </CardTitle>
                        <CardDescription>Cumulative student admissions over the last 7 years</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-56 items-end gap-3">
                            {admissionTrend.map((p) => (
                                <div key={p.year} className="flex flex-1 flex-col items-center gap-2">
                                    <div className="text-xs font-medium text-muted-foreground">{p.total}</div>
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60"
                                        style={{ height: `${(p.total / maxTrend) * 100}%`, minHeight: '4px' }}
                                    />
                                    <div className="text-xs text-muted-foreground">{p.year}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Class Breakdown</CardTitle>
                        <CardDescription>Sections and students per class</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {classBreakdown.map((c) => (
                                <div key={c.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                                    <div className="text-sm font-medium">{c.name}</div>
                                    <div className="flex gap-2 text-xs">
                                        <Badge variant="info">{c.sections_count} sections</Badge>
                                        <Badge variant="success">{c.students_count} students</Badge>
                                    </div>
                                </div>
                            ))}
                            {classBreakdown.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No classes yet. <Link href="/classes/create" className="text-primary underline">Create one</Link>.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Recently Added Students</CardTitle>
                    <CardDescription>The five most recent student records</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Roll No.</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentStudents.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                    {initials(s.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{s.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{s.email ?? '—'}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{s.section?.school_class?.name ?? '—'}</Badge>
                                    </TableCell>
                                    <TableCell>{s.section?.name ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {recentStudents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                                        No students yet. <Link href="/students/create" className="text-primary underline">Create one</Link>.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
