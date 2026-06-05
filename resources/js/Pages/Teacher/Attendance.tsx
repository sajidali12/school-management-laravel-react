import { Head, router } from '@inertiajs/react';
import { CalendarDays, Clock, LogIn, LogOut, CheckCircle2, XCircle, AlertCircle, Coffee } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AttendanceRecord {
    id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
    check_in_at: string | null;
    check_out_at: string | null;
    note: string | null;
    duration: string | null;
}

interface Props {
    todayRecord: AttendanceRecord | null;
    history: AttendanceRecord[];
    stats: Record<string, number>;
    today: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' | 'info' }> = {
    present:  { label: 'Present',   variant: 'success' },
    absent:   { label: 'Absent',    variant: 'destructive' },
    late:     { label: 'Late',      variant: 'warning' },
    half_day: { label: 'Half Day',  variant: 'info' },
    on_leave: { label: 'On Leave',  variant: 'secondary' },
};

function fmt(dt: string | null): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TeacherAttendance({ todayRecord, history, stats, today }: Props) {
    const isCheckedIn  = !!todayRecord?.check_in_at;
    const isCheckedOut = !!todayRecord?.check_out_at;

    const statItems = [
        { label: 'Present',  key: 'present',  color: 'text-emerald-600' },
        { label: 'Late',     key: 'late',     color: 'text-amber-600' },
        { label: 'Absent',   key: 'absent',   color: 'text-rose-600' },
        { label: 'On Leave', key: 'on_leave', color: 'text-slate-500' },
    ];

    return (
        <TeacherLayout title="My Attendance" description="Track your daily check-in and attendance history">
            <Head title="My Attendance" />

            <div className="space-y-6">
                {/* Today card */}
                <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarDays className="h-4 w-4" />
                            Today — {fmtDate(today)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!todayRecord ? (
                            <div className="flex flex-col items-center gap-4 py-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Clock className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold">Not checked in yet</p>
                                    <p className="text-sm text-muted-foreground">Click the button below to record your arrival</p>
                                </div>
                                <Button
                                    className="gap-2"
                                    onClick={() => router.post('/teacher/attendance/check-in')}
                                >
                                    <LogIn className="h-4 w-4" />
                                    Check In Now
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isCheckedOut ? 'bg-emerald-100' : 'bg-sky-100'}`}>
                                        {isCheckedOut
                                            ? <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                                            : <LogIn className="h-7 w-7 text-sky-600" />
                                        }
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusConfig[todayRecord.status].variant}>
                                                {statusConfig[todayRecord.status].label}
                                            </Badge>
                                            {todayRecord.duration && (
                                                <span className="text-xs text-muted-foreground">
                                                    {todayRecord.duration} worked
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap gap-4 text-sm">
                                            <span>
                                                <span className="text-muted-foreground">In: </span>
                                                <span className="font-medium">{fmt(todayRecord.check_in_at)}</span>
                                            </span>
                                            <span>
                                                <span className="text-muted-foreground">Out: </span>
                                                <span className="font-medium">{fmt(todayRecord.check_out_at)}</span>
                                            </span>
                                        </div>
                                        {todayRecord.note && (
                                            <p className="mt-1 text-xs text-muted-foreground">{todayRecord.note}</p>
                                        )}
                                    </div>
                                </div>

                                {isCheckedIn && !isCheckedOut && (
                                    <Button
                                        variant="outline"
                                        className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                                        onClick={() => router.post('/teacher/attendance/check-out')}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Check Out
                                    </Button>
                                )}

                                {isCheckedOut && (
                                    <p className="text-xs text-muted-foreground">
                                        Attendance complete for today.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {statItems.map((item) => (
                        <Card key={item.key}>
                            <CardContent className="p-4 text-center">
                                <p className={`text-2xl font-bold ${item.color}`}>{stats[item.key] ?? 0}</p>
                                <p className="text-xs text-muted-foreground">{item.label} this month</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* History table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Last 30 Days</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Note</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{fmtDate(r.date)}</TableCell>
                                        <TableCell>{fmt(r.check_in_at)}</TableCell>
                                        <TableCell>{fmt(r.check_out_at)}</TableCell>
                                        <TableCell>{r.duration ?? '—'}</TableCell>
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
                                {history.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                            No attendance records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
