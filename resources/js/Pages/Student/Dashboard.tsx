import { Head } from '@inertiajs/react';
import { BookOpen, GraduationCap, Hash } from 'lucide-react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initials } from '@/lib/utils';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface StudentInfo {
    id: number;
    full_name: string;
    roll_number: string;
    email: string | null;
    phone: string | null;
    gender: string | null;
    admission_year: number | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    section?: {
        id: number;
        name: string;
        room: string | null;
        school_class?: { id: number; name: string };
    };
}

interface Props {
    student: StudentInfo;
    subjects: Subject[];
}

export default function StudentDashboard({ student, subjects }: Props) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <StudentLayout title="Dashboard" description="Your academic overview">
            <Head title="Student Dashboard" />

            <div className="space-y-6">
                {/* Welcome */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                {initials(student.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">{greeting}</p>
                            <h2 className="text-xl font-bold">{student.full_name}</h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant="outline">Roll # {student.roll_number}</Badge>
                                {student.section && (
                                    <Badge variant="secondary">
                                        {student.section.school_class?.name} — Section {student.section.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Academic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <GraduationCap className="h-4 w-4" />
                                Academic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Class</span>
                                <span className="font-medium">{student.section?.school_class?.name ?? '—'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Section</span>
                                <span className="font-medium">{student.section?.name ?? '—'}</span>
                            </div>
                            {student.section?.room && (
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Room</span>
                                    <span className="font-medium">{student.section.room}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Roll Number</span>
                                <span className="font-mono font-medium">{student.roll_number}</span>
                            </div>
                            {student.admission_year && (
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Admission Year</span>
                                    <span className="font-medium">{student.admission_year}</span>
                                </div>
                            )}
                            {student.guardian_name && (
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Guardian</span>
                                    <span className="font-medium">{student.guardian_name}</span>
                                </div>
                            )}
                            {student.guardian_phone && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Guardian Phone</span>
                                    <span className="font-medium">{student.guardian_phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subjects */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BookOpen className="h-4 w-4" />
                                My Subjects
                                <Badge variant="secondary" className="ml-auto">{subjects.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {subjects.length === 0 ? (
                                <p className="px-6 pb-6 text-sm text-muted-foreground">No subjects found for your class.</p>
                            ) : (
                                <ul className="divide-y">
                                    {subjects.map((sub) => (
                                        <li key={sub.id} className="flex items-center gap-3 px-6 py-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                <Hash className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{sub.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{sub.code}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StudentLayout>
    );
}
