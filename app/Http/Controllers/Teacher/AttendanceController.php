<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\StaffAttendance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        $teacher = auth()->user()->teacher;
        $today   = today()->toDateString();

        $todayRecord = StaffAttendance::where('teacher_id', $teacher->id)
            ->whereDate('date', $today)
            ->first();

        $history = StaffAttendance::where('teacher_id', $teacher->id)
            ->where('date', '>=', now()->subDays(30)->toDateString())
            ->orderByDesc('date')
            ->get();

        $monthStart  = now()->startOfMonth()->toDateString();
        $statsCounts = StaffAttendance::where('teacher_id', $teacher->id)
            ->where('date', '>=', $monthStart)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Teacher/Attendance', [
            'todayRecord' => $todayRecord,
            'history'     => $history,
            'stats'       => $statsCounts,
            'today'       => $today,
        ]);
    }

    public function checkIn(Request $request): RedirectResponse
    {
        $teacher = auth()->user()->teacher;
        $today   = today()->toDateString();

        if (StaffAttendance::where('teacher_id', $teacher->id)->whereDate('date', $today)->exists()) {
            return back()->with('error', 'You have already checked in today.');
        }

        StaffAttendance::create([
            'teacher_id'  => $teacher->id,
            'date'        => $today,
            'status'      => 'present',
            'check_in_at' => now(),
            'marked_by'   => auth()->id(),
        ]);

        return back()->with('success', 'Checked in at ' . now()->format('h:i A') . '.');
    }

    public function checkOut(Request $request): RedirectResponse
    {
        $teacher = auth()->user()->teacher;
        $today   = today()->toDateString();

        $record = StaffAttendance::where('teacher_id', $teacher->id)
            ->whereDate('date', $today)
            ->firstOrFail();

        if ($record->check_out_at) {
            return back()->with('error', 'You have already checked out today.');
        }

        $record->update(['check_out_at' => now()]);

        return back()->with('success', 'Checked out at ' . now()->format('h:i A') . '.');
    }
}
