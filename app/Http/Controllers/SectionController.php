<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();
        $classFilter = $request->input('school_class_id');

        $sections = Section::query()
            ->with(['schoolClass:id,name', 'classTeacher:id,first_name,last_name'])
            ->withCount('students')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($classFilter, fn ($q) => $q->where('school_class_id', $classFilter))
            ->orderBy('school_class_id')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Sections/Index', [
            'sections' => $sections,
            'filters' => [
                'search' => $search,
                'school_class_id' => $classFilter,
            ],
            'classes' => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sections/Form', [
            'section' => null,
            'classes' => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']),
            'teachers' => Teacher::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(Request $request)
    {
        Section::create($this->validated($request));

        return redirect()->route('sections.index')->with('success', 'Section created.');
    }

    public function edit(Section $section)
    {
        return Inertia::render('Sections/Form', [
            'section' => $section,
            'classes' => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']),
            'teachers' => Teacher::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
        ]);
    }

    public function update(Request $request, Section $section)
    {
        $section->update($this->validated($request, $section->id));

        return redirect()->route('sections.index')->with('success', 'Section updated.');
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return redirect()->route('sections.index')->with('success', 'Section deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'name' => ['required', 'string', 'max:20', Rule::unique('sections', 'name')->where('school_class_id', $request->input('school_class_id'))->ignore($ignoreId)],
            'room' => ['nullable', 'string', 'max:30'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:200'],
            'class_teacher_id' => ['nullable', 'integer', 'exists:teachers,id'],
        ]);
    }
}
