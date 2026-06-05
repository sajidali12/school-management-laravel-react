<?php

namespace App\Http\Controllers;

use App\Models\StaffAttendance;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffAttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->input('date', today()->toDateString());

        $teachers = Teacher::orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'employee_id', 'designation', 'status']);

        $attendances = StaffAttendance::whereDate('date', $date)
            ->get()
            ->keyBy('teacher_id');

        $present  = $attendances->whereIn('status', ['present', 'late', 'half_day'])->count();
        $absent   = $attendances->where('status', 'absent')->count();
        $late     = $attendances->where('status', 'late')->count();
        $onLeave  = $attendances->where('status', 'on_leave')->count();
        $total    = $teachers->where('status', 'active')->count();

        return Inertia::render('StaffAttendance/Index', [
            'teachers'    => $teachers,
            'attendances' => $attendances->values(),
            'date'        => $date,
            'stats'       => [
                'total'      => $total,
                'present'    => $present,
                'absent'     => $absent,
                'late'       => $late,
                'on_leave'   => $onLeave,
                'not_marked' => max(0, $total - $attendances->count()),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'teacher_id'   => 'required|integer|exists:teachers,id',
            'date'         => 'required|date',
            'status'       => 'required|in:present,absent,late,half_day,on_leave',
            'check_in_at'  => 'nullable|date_format:H:i',
            'check_out_at' => 'nullable|date_format:H:i',
            'note'         => 'nullable|string|max:255',
        ]);

        StaffAttendance::create([
            'teacher_id'   => $data['teacher_id'],
            'date'         => $data['date'],
            'status'       => $data['status'],
            'check_in_at'  => $data['check_in_at']  ? Carbon::parse($data['date'] . ' ' . $data['check_in_at'])  : null,
            'check_out_at' => $data['check_out_at'] ? Carbon::parse($data['date'] . ' ' . $data['check_out_at']) : null,
            'note'         => $data['note'] ?? null,
            'marked_by'    => auth()->id(),
        ]);

        return back()->with('success', 'Attendance recorded.');
    }

    public function update(Request $request, StaffAttendance $staffAttendance): RedirectResponse
    {
        $data = $request->validate([
            'status'       => 'required|in:present,absent,late,half_day,on_leave',
            'check_in_at'  => 'nullable|date_format:H:i',
            'check_out_at' => 'nullable|date_format:H:i',
            'note'         => 'nullable|string|max:255',
        ]);

        $staffAttendance->update([
            'status'       => $data['status'],
            'check_in_at'  => $data['check_in_at']
                ? Carbon::parse($staffAttendance->date->toDateString() . ' ' . $data['check_in_at'])
                : null,
            'check_out_at' => $data['check_out_at']
                ? Carbon::parse($staffAttendance->date->toDateString() . ' ' . $data['check_out_at'])
                : null,
            'note'         => $data['note'] ?? null,
            'marked_by'    => auth()->id(),
        ]);

        return back()->with('success', 'Attendance updated.');
    }

    public function markAllPresent(Request $request): RedirectResponse
    {
        $date        = $request->input('date', today()->toDateString());
        $institution = app('currentInstitution');

        $teachers = Teacher::where('status', 'active')->get(['id']);
        $existing = StaffAttendance::whereDate('date', $date)->pluck('teacher_id');

        $rows = $teachers
            ->whereNotIn('id', $existing->toArray())
            ->map(fn ($t) => [
                'institution_id' => $institution->id,
                'teacher_id'     => $t->id,
                'date'           => $date,
                'status'         => 'present',
                'check_in_at'    => Carbon::parse($date . ' 08:00:00'),
                'marked_by'      => auth()->id(),
                'created_at'     => now(),
                'updated_at'     => now(),
            ])
            ->values()
            ->toArray();

        if (! empty($rows)) {
            StaffAttendance::insert($rows);
        }

        return back()->with('success', count($rows) . ' teacher(s) marked present.');
    }
}
