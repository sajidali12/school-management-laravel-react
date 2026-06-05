import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Pencil, Users } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { initials } from '@/lib/utils';

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
    employee_id: string;
    designation: string | null;
    status: string;
}

interface Attendance {
    id: number;
    teacher_id: number;
    status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
    check_in_at: string | null;
    check_out_at: string | null;
    note: string | null;
    duration: string | null;
}

interface Stats {
    total: number;
    present: number;
    absent: number;
    late: number;
    on_leave: number;
    not_marked: number;
}

interface Props {
    teachers: Teacher[];
    attendances: Attendance[];
    date: string;
    stats: Stats;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' | 'info' | 'outline' }> = {
    present:    { label: 'Present',    variant: 'success' },
    absent:     { label: 'Absent',     variant: 'destructive' },
    late:       { label: 'Late',       variant: 'warning' },
    half_day:   { label: 'Half Day',   variant: 'info' },
    on_leave:   { label: 'On Leave',   variant: 'secondary' },
    not_marked: { label: 'Not Marked', variant: 'outline' },
};

function fmt(dt: string | null): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function prevDate(d: string) { const dt = new Date(d); dt.setDate(dt.getDate() - 1); return dt.toISOString().slice(0, 10); }
function nextDate(d: string) { const dt = new Date(d); dt.setDate(dt.getDate() + 1); return dt.toISOString().slice(0, 10); }

interface EditState {
    teacherId: number;
    teacherName: string;
    attendanceId: number | null;
    status: string;
    checkIn: string;
    checkOut: string;
    note: string;
}

export default function StaffAttendanceIndex({ teachers, attendances, date, stats }: Props) {
    const [editState, setEditState] = useState<EditState | null>(null);
    const byTeacher = Object.fromEntries(attendances.map((a) => [a.teacher_id, a]));

    const goToDate = (d: string) => router.get('/staff-attendance', { date: d }, { preserveState: false });

    const openEdit = (teacher: Teacher) => {
        const rec = byTeacher[teacher.id] ?? null;
        setEditState({
            teacherId:    teacher.id,
            teacherName:  `${teacher.first_name} ${teacher.last_name}`,
            attendanceId: rec?.id ?? null,
            status:       rec?.status ?? 'present',
            checkIn:      rec?.check_in_at ? new Date(rec.check_in_at).toTimeString().slice(0, 5) : '',
            checkOut:     rec?.check_out_at ? new Date(rec.check_out_at).toTimeString().slice(0, 5) : '',
            note:         rec?.note ?? '',
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editState) return;

        const payload = {
            status:       editState.status,
            check_in_at:  editState.checkIn || null,
            check_out_at: editState.checkOut || null,
            note:         editState.note || null,
        };

        if (editState.attendanceId) {
            router.put(`/staff-attendance/${editState.attendanceId}`, payload, {
                onSuccess: () => setEditState(null),
            });
        } else {
            router.post('/staff-attendance', { ...payload, teacher_id: editState.teacherId, date }, {
                onSuccess: () => setEditState(null),
            });
        }
    };

    const activeTeachers = teachers.filter((t) => t.status === 'active');

    return (
        <AppLayout
            title="Staff Attendance"
            description="Track and manage daily teacher attendance"
            actions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.post('/staff-attendance/mark-all-present', { date })}
                >
                    Mark All Present
                </Button>
            }
        >
            <Head title="Staff Attendance" />

            <div className="space-y-6">
                {/* Date navigation */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goToDate(prevDate(date))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => goToDate(e.target.value)}
                        className="w-44"
                    />
                    <Button
                        variant="outline" size="icon" className="h-9 w-9"
                        onClick={() => goToDate(nextDate(date))}
                        disabled={date >= new Date().toISOString().slice(0, 10)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'Total Staff', value: stats.total,      color: 'text-foreground' },
                        { label: 'Present',     value: stats.present,    color: 'text-emerald-600' },
                        { label: 'Absent',      value: stats.absent,     color: 'text-rose-600' },
                        { label: 'Late',        value: stats.late,       color: 'text-amber-600' },
                        { label: 'On Leave',    value: stats.on_leave,   color: 'text-slate-500' },
                        { label: 'Not Marked',  value: stats.not_marked, color: 'text-blue-500' },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-3 text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead className="w-16 text-right">Edit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeTeachers.map((t) => {
                                    const rec = byTeacher[t.id] ?? null;
                                    const status = rec?.status ?? 'not_marked';
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                                                            {initials(`${t.first_name} ${t.last_name}`)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{t.first_name} {t.last_name}</p>
                                                        <p className="text-xs text-muted-foreground">{t.employee_id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{fmt(rec?.check_in_at ?? null)}</TableCell>
                                            <TableCell>{fmt(rec?.check_out_at ?? null)}</TableCell>
                                            <TableCell className="text-sm">{rec?.duration ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusConfig[status]?.variant ?? 'outline'}>
                                                    {statusConfig[status]?.label ?? status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
                                                {rec?.note ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8"
                                                    onClick={() => openEdit(t)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {activeTeachers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                            No active teachers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit / Override Dialog */}
            <Dialog open={!!editState} onOpenChange={(o) => !o && setEditState(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {editState?.attendanceId ? 'Override Attendance' : 'Mark Attendance'}
                        </DialogTitle>
                        {editState && (
                            <p className="text-sm text-muted-foreground">{editState.teacherName}</p>
                        )}
                    </DialogHeader>
                    {editState && (
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Status</Label>
                                <Select
                                    value={editState.status}
                                    onValueChange={(v) => setEditState({ ...editState, status: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                        <SelectItem value="half_day">Half Day</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Check In</Label>
                                    <Input
                                        type="time"
                                        value={editState.checkIn}
                                        onChange={(e) => setEditState({ ...editState, checkIn: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Check Out</Label>
                                    <Input
                                        type="time"
                                        value={editState.checkOut}
                                        onChange={(e) => setEditState({ ...editState, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Note (optional)</Label>
                                <Input
                                    placeholder="e.g. Approved leave"
                                    value={editState.note}
                                    onChange={(e) => setEditState({ ...editState, note: e.target.value })}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditState(null)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
