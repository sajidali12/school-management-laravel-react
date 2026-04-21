<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();
        $classFilter = $request->input('school_class_id');
        $sectionFilter = $request->input('section_id');
        $statusFilter = $request->input('status');

        $students = Student::query()
            ->with(['section:id,name,school_class_id', 'section.schoolClass:id,name'])
            ->when($search !== '', fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('roll_number', 'like', "%{$search}%");
            }))
            ->when($classFilter, fn ($q) => $q->whereHas('section', fn ($q) => $q->where('school_class_id', $classFilter)))
            ->when($sectionFilter, fn ($q) => $q->where('section_id', $sectionFilter))
            ->when($statusFilter, fn ($q) => $q->where('status', $statusFilter))
            ->orderBy('roll_number')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => [
                'search' => $search,
                'school_class_id' => $classFilter,
                'section_id' => $sectionFilter,
                'status' => $statusFilter,
            ],
            'classes' => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']),
            'sections' => Section::with('schoolClass:id,name')->orderBy('school_class_id')->orderBy('name')->get(['id', 'name', 'school_class_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Students/Form', [
            'student' => null,
            'sections' => Section::with('schoolClass:id,name')->orderBy('school_class_id')->orderBy('name')->get(['id', 'name', 'school_class_id']),
        ]);
    }

    public function store(Request $request)
    {
        Student::create($this->validated($request));

        return redirect()->route('students.index')->with('success', 'Student created.');
    }

    public function edit(Student $student)
    {
        return Inertia::render('Students/Form', [
            'student' => $student,
            'sections' => Section::with('schoolClass:id,name')->orderBy('school_class_id')->orderBy('name')->get(['id', 'name', 'school_class_id']),
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $student->update($this->validated($request, $student->id));

        return redirect()->route('students.index')->with('success', 'Student updated.');
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()->route('students.index')->with('success', 'Student deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $institutionId = app('currentInstitution')->id ?? null;

        return $request->validate([
            'section_id' => ['required', 'integer', 'exists:sections,id'],
            'roll_number' => ['required', 'string', 'max:40', Rule::unique('students', 'roll_number')->where('section_id', $request->input('section_id'))->ignore($ignoreId)],
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:180', Rule::unique('students', 'email')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'phone' => ['nullable', 'string', 'max:30'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'guardian_name' => ['nullable', 'string', 'max:120'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'admission_year' => ['nullable', 'integer', 'min:1990', 'max:' . ((int) date('Y') + 1)],
            'status' => ['required', 'in:active,graduated,transferred,dropped'],
        ]);
    }
}
