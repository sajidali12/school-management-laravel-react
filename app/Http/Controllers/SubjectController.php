<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();

        $subjects = Subject::query()
            ->withCount('classes')
            ->when($search !== '', fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Subjects/Index', [
            'subjects' => $subjects,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Subjects/Form', [
            'subject' => null,
            'classes' => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']),
            'assignedClasses' => [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $classIds = $data['class_ids'] ?? [];
        unset($data['class_ids']);

        $subject = Subject::create($data);
        $subject->classes()->sync($classIds);

        return redirect()->route('subjects.index')->with('success', 'Subject created.');
    }

    public function edit(Subject $subject)
    {
        return Inertia::render('Subjects/Form', [
            'subject' => $subject,
            'classes' => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']),
            'assignedClasses' => $subject->classes()->pluck('school_classes.id'),
        ]);
    }

    public function update(Request $request, Subject $subject)
    {
        $data = $this->validated($request, $subject->id);
        $classIds = $data['class_ids'] ?? [];
        unset($data['class_ids']);

        $subject->update($data);
        $subject->classes()->sync($classIds);

        return redirect()->route('subjects.index')->with('success', 'Subject updated.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->route('subjects.index')->with('success', 'Subject deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $institutionId = app('currentInstitution')->id ?? null;

        return $request->validate([
            'code' => ['required', 'string', 'max:30', Rule::unique('subjects', 'code')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
            'class_ids' => ['nullable', 'array'],
            'class_ids.*' => ['integer', 'exists:school_classes,id'],
        ]);
    }
}
