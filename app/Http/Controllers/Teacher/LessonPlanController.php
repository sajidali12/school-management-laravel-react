<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LessonPlan;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LessonPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher    = auth()->user()->teacher;
        $sectionId  = $request->integer('section_id') ?: null;

        $plans = LessonPlan::where('teacher_id', $teacher->id)
            ->with(['section.schoolClass', 'subject'])
            ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId))
            ->orderByDesc('week_start_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Teacher/LessonPlans/Index', [
            'plans'    => $plans,
            'sections' => $this->teacherSections($teacher->id),
            'filters'  => ['section_id' => $sectionId],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Teacher/LessonPlans/Form', [
            'plan'     => null,
            'sections' => $this->teacherSections(auth()->user()->teacher->id),
            'subjects' => Subject::orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $teacher = auth()->user()->teacher;

        $plan = LessonPlan::create([
            'teacher_id'      => $teacher->id,
            'section_id'      => $data['section_id'],
            'subject_id'      => $data['subject_id'] ?? null,
            'title'           => $data['title'],
            'description'     => $data['description'] ?? null,
            'week_start_date' => $data['week_start_date'],
            'file_path'       => $request->hasFile('file') ? $request->file('file')->store('lesson-plans', 'public') : null,
            'file_name'       => $request->hasFile('file') ? $request->file('file')->getClientOriginalName() : null,
        ]);

        return redirect()->route('teacher.lesson-plans.index')->with('success', 'Lesson plan created.');
    }

    public function edit(LessonPlan $lessonPlan): Response
    {
        abort_unless($lessonPlan->teacher_id === auth()->user()->teacher->id, 403);

        return Inertia::render('Teacher/LessonPlans/Form', [
            'plan'     => $lessonPlan->load(['section.schoolClass', 'subject']),
            'sections' => $this->teacherSections(auth()->user()->teacher->id),
            'subjects' => Subject::orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function update(Request $request, LessonPlan $lessonPlan): RedirectResponse
    {
        abort_unless($lessonPlan->teacher_id === auth()->user()->teacher->id, 403);

        $data = $this->validated($request);

        $filePath = $lessonPlan->file_path;
        $fileName = $lessonPlan->file_name;

        if ($request->hasFile('file')) {
            if ($filePath) Storage::disk('public')->delete($filePath);
            $filePath = $request->file('file')->store('lesson-plans', 'public');
            $fileName = $request->file('file')->getClientOriginalName();
        }

        $lessonPlan->update([
            'section_id'      => $data['section_id'],
            'subject_id'      => $data['subject_id'] ?? null,
            'title'           => $data['title'],
            'description'     => $data['description'] ?? null,
            'week_start_date' => $data['week_start_date'],
            'file_path'       => $filePath,
            'file_name'       => $fileName,
        ]);

        return redirect()->route('teacher.lesson-plans.index')->with('success', 'Lesson plan updated.');
    }

    public function destroy(LessonPlan $lessonPlan): RedirectResponse
    {
        abort_unless($lessonPlan->teacher_id === auth()->user()->teacher->id, 403);

        if ($lessonPlan->file_path) Storage::disk('public')->delete($lessonPlan->file_path);
        $lessonPlan->delete();

        return back()->with('success', 'Lesson plan deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'section_id'      => 'required|integer|exists:sections,id',
            'subject_id'      => 'nullable|integer|exists:subjects,id',
            'title'           => 'required|string|max:200',
            'description'     => 'nullable|string',
            'week_start_date' => 'required|date',
            'file'            => 'nullable|file|max:10240',
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
