<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentAttendanceRecord;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        $student = auth()->user()->student()->with('section.schoolClass')->firstOrFail();

        // All attendance records for this student (most recent first)
        $records = StudentAttendanceRecord::where('student_id', $student->id)
            ->join('student_attendances', 'student_attendances.id', '=', 'student_attendance_records.attendance_id')
            ->select(
                'student_attendance_records.id',
                'student_attendance_records.status',
                'student_attendance_records.note',
                'student_attendances.date',
            )
            ->orderByDesc('student_attendances.date')
            ->limit(90)
            ->get();

        // Overall stats (all time)
        $totals = StudentAttendanceRecord::where('student_id', $student->id)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalDays  = $totals->sum();
        $presentDays = ($totals['present'] ?? 0) + ($totals['late'] ?? 0) + ($totals['excused'] ?? 0);
        $percentage  = $totalDays > 0 ? round(($presentDays / $totalDays) * 100) : null;

        // This month stats
        $monthStart = now()->startOfMonth()->toDateString();
        $monthStats = StudentAttendanceRecord::where('student_id', $student->id)
            ->join('student_attendances', 'student_attendances.id', '=', 'student_attendance_records.attendance_id')
            ->where('student_attendances.date', '>=', $monthStart)
            ->selectRaw('student_attendance_records.status, COUNT(*) as count')
            ->groupBy('student_attendance_records.status')
            ->pluck('count', 'status');

        return Inertia::render('Student/Attendance', [
            'student'    => $student,
            'records'    => $records,
            'totals'     => $totals,
            'monthStats' => $monthStats,
            'percentage' => $percentage,
            'totalDays'  => $totalDays,
        ]);
    }
}
