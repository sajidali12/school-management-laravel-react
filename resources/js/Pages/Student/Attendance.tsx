import { Head } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Record {
    id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    note: string | null;
}

interface StudentInfo {
    full_name: string;
    roll_number: string;
    section?: { name: string; school_class?: { name: string } };
}

interface Props {
    student: StudentInfo;
    records: Record[];
    totals: Partial<{ present: number; absent: number; late: number; excused: number }>;
    monthStats: Partial<{ present: number; absent: number; late: number; excused: number }>;
    percentage: number | null;
    totalDays: number;
}

const statusConfig = {
    present: { label: 'Present',  variant: 'success'     as const },
    absent:  { label: 'Absent',   variant: 'destructive' as const },
    late:    { label: 'Late',     variant: 'warning'     as const },
    excused: { label: 'Excused',  variant: 'info'        as const },
};

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StudentAttendancePage({ student, records, totals, monthStats, percentage, totalDays }: Props) {
    const pctColor = percentage === null ? 'text-muted-foreground'
        : percentage >= 75 ? 'text-emerald-600'
        : percentage >= 60 ? 'text-amber-600'
        : 'text-rose-600';

    return (
        <StudentLayout title="My Attendance" description="Your attendance record">
            <Head title="My Attendance" />

            <div className="space-y-6">
                {/* Overall percentage */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Overall Attendance</p>
                            <p className={`text-4xl font-bold ${pctColor}`}>
                                {percentage !== null ? `${percentage}%` : '—'}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {totalDays} day{totalDays !== 1 ? 's' : ''} recorded
                            </p>
                        </div>
                        <div className="text-right text-sm space-y-1">
                            <p><span className="text-emerald-600 font-semibold">{totals.present ?? 0}</span> Present</p>
                            <p><span className="text-rose-600 font-semibold">{totals.absent ?? 0}</span> Absent</p>
                            <p><span className="text-amber-600 font-semibold">{totals.late ?? 0}</span> Late</p>
                            <p><span className="text-blue-600 font-semibold">{totals.excused ?? 0}</span> Excused</p>
                        </div>
                    </CardContent>
                </Card>

                {/* This month */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(['present', 'absent', 'late', 'excused'] as const).map((s) => (
                        <Card key={s}>
                            <CardContent className="p-4 text-center">
                                <p className={`text-2xl font-bold ${
                                    s === 'present' ? 'text-emerald-600' :
                                    s === 'absent'  ? 'text-rose-600' :
                                    s === 'late'    ? 'text-amber-600' : 'text-blue-600'
                                }`}>
                                    {monthStats[s] ?? 0}
                                </p>
                                <p className="text-xs capitalize text-muted-foreground">{s} this month</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* History */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Attendance History (Last 90 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Note</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{fmtDate(r.date)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusConfig[r.status]?.variant ?? 'secondary'}>
                                                {statusConfig[r.status]?.label ?? r.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {r.note ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {records.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                                            No attendance records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
