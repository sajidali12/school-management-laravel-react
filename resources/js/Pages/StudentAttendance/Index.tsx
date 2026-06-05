import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { initials } from '@/lib/utils';

interface StudentRow {
    id: number;
    full_name: string;
    roll_number: string;
    status: string;
    note: string | null;
}

interface Section { id: number; name: string; school_class_id: number; school_class?: { name: string } }
interface SchoolClass { id: number; name: string }

interface Session {
    id: number;
    date: string;
    teacher: string | null;
}

interface Stats {
    present: number;
    absent: number;
    late: number;
    excused: number;
}

interface Filters { section_id: number | null; date: string }

interface Props {
    classes: SchoolClass[];
    sections: Section[];
    students: StudentRow[];
    session: Session | null;
    stats: Stats | null;
    filters: Filters;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'info' | 'outline' }> = {
    present:    { label: 'Present',    variant: 'success' },
    absent:     { label: 'Absent',     variant: 'destructive' },
    late:       { label: 'Late',       variant: 'warning' },
    excused:    { label: 'Excused',    variant: 'info' },
    not_marked: { label: 'Not Marked', variant: 'outline' },
};

export default function StudentAttendanceIndex({ classes, sections, students, session, stats, filters }: Props) {
    const apply = (patch: Partial<Filters>) => {
        router.get('/student-attendance', { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    const filteredSections = filters.section_id
        ? sections
        : sections;

    return (
        <AppLayout title="Student Attendance" description="View student attendance by section and date">
            <Head title="Student Attendance" />

            <div className="space-y-6">
                {/* Filters */}
                <Card>
                    <CardContent className="flex flex-wrap gap-3 p-4">
                        <Select
                            value={filters.section_id ? String(filters.section_id) : '__all__'}
                            onValueChange={(v) => apply({ section_id: v === '__all__' ? null : Number(v) })}
                        >
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Select a section…</SelectItem>
                                {sections.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.school_class?.name} — {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            type="date"
                            value={filters.date}
                            onChange={(e) => apply({ date: e.target.value })}
                            className="w-44"
                        />
                    </CardContent>
                </Card>

                {/* Stats */}
                {stats && session && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Attendance taken on{' '}
                            {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            {session.teacher && <> by <strong>{session.teacher}</strong></>}
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { label: 'Present',  value: stats.present,  color: 'text-emerald-600' },
                                { label: 'Absent',   value: stats.absent,   color: 'text-rose-600' },
                                { label: 'Late',     value: stats.late,     color: 'text-amber-600' },
                                { label: 'Excused',  value: stats.excused,  color: 'text-blue-600' },
                            ].map((s) => (
                                <Card key={s.label}>
                                    <CardContent className="p-3 text-center">
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Student table */}
                {filters.section_id ? (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Roll No.</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Note</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                            {initials(s.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{s.full_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{s.roll_number}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusConfig[s.status]?.variant ?? 'outline'}>
                                                    {statusConfig[s.status]?.label ?? s.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {s.note ?? '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {students.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                                                {session ? 'No students found.' : 'No attendance recorded for this date.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center text-sm text-muted-foreground">
                            Select a section and date to view attendance.
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
