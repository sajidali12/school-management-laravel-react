<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();

        $classes = SchoolClass::query()
            ->withCount(['sections', 'subjects'])
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('level')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Classes/Form', [
            'schoolClass' => null,
            'subjectOptions' => Subject::orderBy('name')->get(['id', 'code', 'name']),
            'assignedSubjects' => [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $subjectIds = $data['subject_ids'] ?? [];
        unset($data['subject_ids']);

        $schoolClass = SchoolClass::create($data);
        $schoolClass->subjects()->sync($subjectIds);

        return redirect()->route('classes.index')->with('success', 'Class created.');
    }

    public function edit(SchoolClass $schoolClass)
    {
        return Inertia::render('Classes/Form', [
            'schoolClass' => $schoolClass,
            'subjectOptions' => Subject::orderBy('name')->get(['id', 'code', 'name']),
            'assignedSubjects' => $schoolClass->subjects()->pluck('subjects.id'),
        ]);
    }

    public function update(Request $request, SchoolClass $schoolClass)
    {
        $data = $this->validated($request, $schoolClass->id);
        $subjectIds = $data['subject_ids'] ?? [];
        unset($data['subject_ids']);

        $schoolClass->update($data);
        $schoolClass->subjects()->sync($subjectIds);

        return redirect()->route('classes.index')->with('success', 'Class updated.');
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolClass->delete();

        return redirect()->route('classes.index')->with('success', 'Class deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $institutionId = app('currentInstitution')->id ?? null;

        return $request->validate([
            'name' => ['required', 'string', 'max:60', Rule::unique('school_classes', 'name')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'level' => ['nullable', 'integer', 'min:1', 'max:20'],
            'description' => ['nullable', 'string'],
            'subject_ids' => ['nullable', 'array'],
            'subject_ids.*' => ['integer', 'exists:subjects,id'],
        ]);
    }
}
