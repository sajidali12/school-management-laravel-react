<?php

namespace App\Http\Controllers;

use App\Models\StaffAttendance;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherPortalController extends Controller
{
    public function __invoke()
    {
        $user    = auth()->user();
        $teacher = $user->teacher()
            ->with(['classSections' => fn ($q) => $q->with('schoolClass')->withCount('students')])
            ->firstOrFail();

        $subjects = DB::table('section_subject_teacher')
            ->join('subjects', 'subjects.id', '=', 'section_subject_teacher.subject_id')
            ->where('section_subject_teacher.teacher_id', $teacher->id)
            ->select('subjects.id', 'subjects.name', 'subjects.code')
            ->distinct()
            ->get();

        $todayAttendance = StaffAttendance::where('teacher_id', $teacher->id)
            ->whereDate('date', today())
            ->first();

        return Inertia::render('Teacher/Dashboard', [
            'teacher'         => $teacher,
            'sections'        => $teacher->classSections,
            'subjects'        => $subjects,
            'todayAttendance' => $todayAttendance,
            'stats'           => [
                'sections' => $teacher->classSections->count(),
                'subjects' => $subjects->count(),
                'students' => $teacher->classSections->sum('students_count'),
            ],
        ]);
    }
}
