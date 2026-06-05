<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentAttendanceRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentAttendanceController extends Controller
{
    public function index(): Response
    {
        $teacher = auth()->user()->teacher;
        $today   = today()->toDateString();

        // Sections where this teacher is class teacher
        $classSections = Section::where('class_teacher_id', $teacher->id)
            ->with('schoolClass')
            ->withCount(['students' => fn ($q) => $q->where('status', 'active')])
            ->get();

        // Sections where this teacher teaches subjects
        $subjectSectionIds = DB::table('section_subject_teacher')
            ->where('teacher_id', $teacher->id)
            ->pluck('section_id');

        $subjectSections = Section::whereIn('id', $subjectSectionIds)
            ->where('class_teacher_id', '!=', $teacher->id)
            ->with('schoolClass')
            ->withCount(['students' => fn ($q) => $q->where('status', 'active')])
            ->get();

        $sections = $classSections->merge($subjectSections)->unique('id')->values();

        // Today's attendance status per section
        $todaySessions = StudentAttendance::whereIn('section_id', $sections->pluck('id'))
            ->whereDate('date', $today)
            ->with(['records'])
            ->get()
            ->keyBy('section_id');

        return Inertia::render('Teacher/StudentAttendance/Index', [
            'sections'     => $sections,
            'todaySessions'=> $todaySessions->values(),
            'today'        => $today,
        ]);
    }

    public function take(Request $request): Response
    {
        $sectionId = $request->integer('section_id');
        $date      = $request->input('date', today()->toDateString());

        $section = Section::with('schoolClass')->findOrFail($sectionId);

        $students = Student::where('section_id', $sectionId)
            ->where('status', 'active')
            ->orderBy('roll_number')
            ->get(['id', 'first_name', 'last_name', 'roll_number']);

        $session = StudentAttendance::where('section_id', $sectionId)
            ->whereDate('date', $date)
            ->with('records')
            ->first();

        $existingRecords = $session
            ? $session->records->keyBy('student_id')->map(fn ($r) => ['status' => $r->status, 'note' => $r->note])
            : collect();

        return Inertia::render('Teacher/StudentAttendance/Take', [
            'section'         => $section,
            'students'        => $students,
            'date'            => $date,
            'sessionId'       => $session?->id,
            'existingRecords' => $existingRecords,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'section_id'              => 'required|integer|exists:sections,id',
            'date'                    => 'required|date',
            'records'                 => 'required|array|min:1',
            'records.*.student_id'    => 'required|integer|exists:students,id',
            'records.*.status'        => 'required|in:present,absent,late,excused',
            'records.*.note'          => 'nullable|string|max:255',
        ]);

        $teacher = auth()->user()->teacher;

        $session = StudentAttendance::updateOrCreate(
            ['section_id' => $data['section_id'], 'date' => $data['date']],
            ['teacher_id' => $teacher->id],
        );

        foreach ($data['records'] as $rec) {
            StudentAttendanceRecord::updateOrCreate(
                ['attendance_id' => $session->id, 'student_id' => $rec['student_id']],
                ['status' => $rec['status'], 'note' => $rec['note'] ?? null],
            );
        }

        return redirect()->route('teacher.student-attendance.index')
            ->with('success', 'Attendance saved for ' . $data['date'] . '.');
    }
}
