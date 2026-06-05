import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { initials } from '@/lib/utils';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    roll_number: string;
}

interface Section {
    id: number;
    name: string;
    school_class?: { name: string };
}

interface ExistingRecord {
    status: string;
    note: string | null;
}

type Status = 'present' | 'absent' | 'late' | 'excused';

interface Props {
    section: Section;
    students: Student[];
    date: string;
    sessionId: number | null;
    existingRecords: Record<number, ExistingRecord>;
}

const statusStyles: Record<Status, string> = {
    present: 'bg-emerald-500 text-white hover:bg-emerald-600',
    absent:  'bg-rose-500 text-white hover:bg-rose-600',
    late:    'bg-amber-500 text-white hover:bg-amber-600',
    excused: 'bg-blue-500 text-white hover:bg-blue-600',
};

const statusInactive = 'bg-muted text-muted-foreground hover:bg-muted/80';

export default function TakeAttendance({ section, students, date, sessionId, existingRecords }: Props) {
    const [records, setRecords] = useState<Record<number, { status: Status; note: string }>>(() => {
        const init: Record<number, { status: Status; note: string }> = {};
        students.forEach((s) => {
            const existing = existingRecords[s.id];
            init[s.id] = {
                status: (existing?.status as Status) ?? 'present',
                note:   existing?.note ?? '',
            };
        });
        return init;
    });

    const [selectedDate, setSelectedDate] = useState(date);

    const setStatus = (studentId: number, status: Status) => {
        setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
    };

    const markAll = (status: Status) => {
        setRecords((prev) => {
            const next = { ...prev };
            students.forEach((s) => { next[s.id] = { ...next[s.id], status }; });
            return next;
        });
    };

    const stats = students.reduce(
        (acc, s) => { acc[records[s.id]?.status ?? 'present']++; return acc; },
        { present: 0, absent: 0, late: 0, excused: 0 } as Record<Status, number>
    );

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const payload = students.map((s) => ({
            student_id: s.id,
            status:     records[s.id]?.status ?? 'present',
            note:       records[s.id]?.note || null,
        }));

        router.post('/teacher/student-attendance', {
            section_id: section.id,
            date:       selectedDate,
            records:    payload,
        });
    };

    return (
        <TeacherLayout
            title="Take Attendance"
            description={`${section.school_class?.name} — Section ${section.name}`}
        >
            <Head title="Take Attendance" />

            <form onSubmit={onSubmit} className="space-y-5">
                {/* Controls */}
                <Card>
                    <CardContent className="flex flex-wrap items-center gap-3 p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Date:</span>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-44"
                            />
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <Button type="button" size="sm" variant="outline" onClick={() => markAll('present')}>
                                All Present
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => markAll('absent')}>
                                All Absent
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary bar */}
                <div className="flex flex-wrap gap-3">
                    {((['present', 'absent', 'late', 'excused'] as Status[])).map((s) => (
                        <div key={s} className="flex items-center gap-1.5 text-sm">
                            <span className={`h-2.5 w-2.5 rounded-full ${
                                s === 'present' ? 'bg-emerald-500' :
                                s === 'absent'  ? 'bg-rose-500' :
                                s === 'late'    ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <span className="capitalize font-medium">{s}</span>
                            <span className="text-muted-foreground">{stats[s]}</span>
                        </div>
                    ))}
                    <span className="text-sm text-muted-foreground ml-auto">{students.length} students total</span>
                </div>

                {/* Student list */}
                <Card>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {students.map((student, idx) => {
                                const current = records[student.id]?.status ?? 'present';
                                return (
                                    <li key={student.id} className="flex items-center gap-3 px-4 py-3">
                                        <span className="w-6 text-xs text-muted-foreground text-right">{idx + 1}</span>
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                {initials(`${student.first_name} ${student.last_name}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {student.first_name} {student.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{student.roll_number}</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            {(['present', 'absent', 'late', 'excused'] as Status[]).map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setStatus(student.id, s)}
                                                    className={`h-8 w-8 rounded text-xs font-bold transition-colors ${
                                                        current === s ? statusStyles[s] : statusInactive
                                                    }`}
                                                    title={s.charAt(0).toUpperCase() + s.slice(1)}
                                                >
                                                    {s[0].toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" className="gap-2">
                        <Save className="h-4 w-4" />
                        {sessionId ? 'Update Attendance' : 'Save Attendance'}
                    </Button>
                </div>
            </form>
        </TeacherLayout>
    );
}
