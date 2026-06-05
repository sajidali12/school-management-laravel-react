<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentAttendanceRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentAttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $sectionId = $request->integer('section_id') ?: null;
        $date      = $request->input('date', today()->toDateString());

        $classes  = SchoolClass::orderBy('level')->get(['id', 'name']);
        $sections = Section::with('schoolClass:id,name')->orderBy('school_class_id')->orderBy('name')->get(['id', 'name', 'school_class_id']);

        $session = $sectionId
            ? StudentAttendance::where('section_id', $sectionId)
                ->whereDate('date', $date)
                ->with(['records.student', 'section.schoolClass', 'teacher'])
                ->first()
            : null;

        // Summary: if section selected, show all students with their status for the date
        $students = [];
        if ($sectionId) {
            $allStudents = Student::where('section_id', $sectionId)
                ->where('status', 'active')
                ->orderBy('roll_number')
                ->get(['id', 'first_name', 'last_name', 'roll_number']);

            $recordMap = $session
                ? $session->records->keyBy('student_id')
                : collect();

            $students = $allStudents->map(fn ($s) => [
                'id'          => $s->id,
                'full_name'   => $s->first_name . ' ' . $s->last_name,
                'roll_number' => $s->roll_number,
                'status'      => $recordMap[$s->id]?->status ?? 'not_marked',
                'note'        => $recordMap[$s->id]?->note,
            ]);
        }

        $stats = $session ? [
            'present' => $session->records->where('status', 'present')->count(),
            'absent'  => $session->records->where('status', 'absent')->count(),
            'late'    => $session->records->where('status', 'late')->count(),
            'excused' => $session->records->where('status', 'excused')->count(),
        ] : null;

        return Inertia::render('StudentAttendance/Index', [
            'classes'   => $classes,
            'sections'  => $sections,
            'students'  => $students,
            'session'   => $session ? [
                'id'      => $session->id,
                'date'    => $session->date->toDateString(),
                'teacher' => $session->teacher?->full_name,
            ] : null,
            'stats'     => $stats,
            'filters'   => ['section_id' => $sectionId, 'date' => $date],
        ]);
    }

    public function updateRecord(Request $request, StudentAttendanceRecord $record): RedirectResponse
    {
        $data = $request->validate([
            'status' => 'required|in:present,absent,late,excused',
            'note'   => 'nullable|string|max:255',
        ]);

        $record->update($data);

        return back()->with('success', 'Record updated.');
    }
}
