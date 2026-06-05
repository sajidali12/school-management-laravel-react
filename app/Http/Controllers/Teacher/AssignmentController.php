<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\InAppNotification;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher   = auth()->user()->teacher;
        $sectionId = $request->integer('section_id') ?: null;

        $assignments = Assignment::where('teacher_id', $teacher->id)
            ->with(['section.schoolClass', 'subject'])
            ->withCount('submissions')
            ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId))
            ->orderByDesc('due_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Teacher/Assignments/Index', [
            'assignments' => $assignments,
            'sections'    => $this->teacherSections($teacher->id),
            'filters'     => ['section_id' => $sectionId],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Teacher/Assignments/Form', [
            'assignment' => null,
            'sections'   => $this->teacherSections(auth()->user()->teacher->id),
            'subjects'   => Subject::orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data    = $this->validated($request);
        $teacher = auth()->user()->teacher;
        $inst    = app('currentInstitution');

        $assignment = Assignment::create([
            'teacher_id'   => $teacher->id,
            'section_id'   => $data['section_id'],
            'subject_id'   => $data['subject_id'] ?? null,
            'title'        => $data['title'],
            'instructions' => $data['instructions'] ?? null,
            'due_date'     => $data['due_date'],
            'total_marks'  => $data['total_marks'] ?? null,
            'file_path'    => $request->hasFile('file') ? $request->file('file')->store('assignments', 'public') : null,
            'file_name'    => $request->hasFile('file') ? $request->file('file')->getClientOriginalName() : null,
        ]);

        // Notify students in the section
        $studentIds = Student::where('section_id', $data['section_id'])
            ->where('status', 'active')
            ->pluck('id');

        $userIds = User::whereIn('student_id', $studentIds)->pluck('id')->toArray();

        InAppNotification::broadcast(
            $userIds,
            $inst->id,
            'new_assignment',
            'New Assignment: ' . $assignment->title,
            "A new assignment has been posted for your class. Due: " . $assignment->due_date->format('M d, Y h:i A'),
            '/student/assignments'
        );

        return redirect()->route('teacher.assignments.index')->with('success', 'Assignment created and students notified.');
    }

    public function edit(Assignment $assignment): Response
    {
        abort_unless($assignment->teacher_id === auth()->user()->teacher->id, 403);

        return Inertia::render('Teacher/Assignments/Form', [
            'assignment' => $assignment->load(['section.schoolClass', 'subject']),
            'sections'   => $this->teacherSections(auth()->user()->teacher->id),
            'subjects'   => Subject::orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function update(Request $request, Assignment $assignment): RedirectResponse
    {
        abort_unless($assignment->teacher_id === auth()->user()->teacher->id, 403);

        $data = $this->validated($request);

        $filePath = $assignment->file_path;
        $fileName = $assignment->file_name;

        if ($request->hasFile('file')) {
            if ($filePath) Storage::disk('public')->delete($filePath);
            $filePath = $request->file('file')->store('assignments', 'public');
            $fileName = $request->file('file')->getClientOriginalName();
        }

        $assignment->update([
            'section_id'   => $data['section_id'],
            'subject_id'   => $data['subject_id'] ?? null,
            'title'        => $data['title'],
            'instructions' => $data['instructions'] ?? null,
            'due_date'     => $data['due_date'],
            'total_marks'  => $data['total_marks'] ?? null,
            'file_path'    => $filePath,
            'file_name'    => $fileName,
        ]);

        return redirect()->route('teacher.assignments.index')->with('success', 'Assignment updated.');
    }

    public function destroy(Assignment $assignment): RedirectResponse
    {
        abort_unless($assignment->teacher_id === auth()->user()->teacher->id, 403);

        if ($assignment->file_path) Storage::disk('public')->delete($assignment->file_path);

        // Delete submission files too
        foreach ($assignment->submissions as $sub) {
            if ($sub->file_path) Storage::disk('public')->delete($sub->file_path);
        }

        $assignment->delete();

        return back()->with('success', 'Assignment deleted.');
    }

    public function submissions(Assignment $assignment): Response
    {
        abort_unless($assignment->teacher_id === auth()->user()->teacher->id, 403);

        $students = Student::where('section_id', $assignment->section_id)
            ->where('status', 'active')
            ->orderBy('roll_number')
            ->get(['id', 'first_name', 'last_name', 'roll_number']);

        $submissions = $assignment->submissions()
            ->get()
            ->keyBy('student_id');

        return Inertia::render('Teacher/Assignments/Submissions', [
            'assignment'  => $assignment->load(['section.schoolClass', 'subject']),
            'students'    => $students,
            'submissions' => $submissions->values(),
        ]);
    }

    public function gradeSubmission(Request $request, AssignmentSubmission $submission): RedirectResponse
    {
        abort_unless($submission->assignment->teacher_id === auth()->user()->teacher->id, 403);

        $data = $request->validate([
            'marks'    => ['nullable', 'numeric', 'min:0', 'max:' . ($submission->assignment->total_marks ?? 9999)],
            'feedback' => 'nullable|string|max:1000',
        ]);

        $submission->update([
            'marks'    => $data['marks'] ?? null,
            'feedback' => $data['feedback'] ?? null,
            'status'   => 'graded',
        ]);

        // Notify student
        $user = User::where('student_id', $submission->student_id)->first();
        if ($user) {
            InAppNotification::send(
                $user->id,
                $submission->assignment->institution_id,
                'assignment_graded',
                'Assignment Graded',
                "Your submission for \"{$submission->assignment->title}\" has been graded." .
                ($data['marks'] !== null ? " Marks: {$data['marks']}/{$submission->assignment->total_marks}" : ''),
                '/student/assignments'
            );
        }

        return back()->with('success', 'Submission graded.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'section_id'   => 'required|integer|exists:sections,id',
            'subject_id'   => 'nullable|integer|exists:subjects,id',
            'title'        => 'required|string|max:200',
            'instructions' => 'nullable|string',
            'due_date'     => 'required|date',
            'total_marks'  => 'nullable|numeric|min:0|max:9999',
            'file'         => 'nullable|file|max:10240',
        ]);
    }

    private function teacherSections(int $teacherId): \Illuminate\Support\Collection
    {
        $classIds   = Section::where('class_teacher_id', $teacherId)->pluck('id');
        $subjectIds = DB::table('section_subject_teacher')->where('teacher_id', $teacherId)->pluck('section_id');

        return Section::whereIn('id', $classIds->merge($subjectIds)->unique())
            ->with('schoolClass:id,name')
            ->orderBy('school_class_id')
            ->orderBy('name')
            ->get(['id', 'name', 'school_class_id']);
    }
}
