<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(): Response
    {
        $user    = auth()->user();
        $student = $user->student()->with('section')->firstOrFail();

        $assignments = Assignment::where('section_id', $student->section_id)
            ->with(['subject', 'teacher'])
            ->withCount('submissions')
            ->orderByDesc('due_date')
            ->get();

        // Attach this student's submission to each assignment
        $submissionMap = AssignmentSubmission::where('student_id', $student->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->get()
            ->keyBy('assignment_id');

        $assignments = $assignments->map(fn ($a) => array_merge($a->toArray(), [
            'my_submission' => $submissionMap[$a->id] ?? null,
        ]));

        return Inertia::render('Student/Assignments', [
            'assignments' => $assignments->values(),
            'studentId'   => $student->id,
        ]);
    }

    public function submit(Request $request, Assignment $assignment): RedirectResponse
    {
        $student = auth()->user()->student;

        // Ensure assignment is for this student's section
        abort_unless($assignment->section_id === $student->section_id, 403);

        $request->validate([
            'file' => 'required|file|max:20480',
        ]);

        $existing = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        // Delete old file if re-submitting
        if ($existing?->file_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($existing->file_path);
        }

        $path = $request->file('file')->store('submissions', 'public');
        $name = $request->file('file')->getClientOriginalName();

        AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_id' => $student->id],
            [
                'file_path'    => $path,
                'file_name'    => $name,
                'submitted_at' => now(),
                'status'       => 'submitted',
                'marks'        => null,
                'feedback'     => null,
            ]
        );

        return back()->with('success', 'Assignment submitted successfully.');
    }
}
