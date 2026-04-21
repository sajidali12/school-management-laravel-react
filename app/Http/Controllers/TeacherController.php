<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();
        $statusFilter = $request->input('status');

        $teachers = Teacher::query()
            ->when($search !== '', fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            }))
            ->when($statusFilter, fn ($q) => $q->where('status', $statusFilter))
            ->orderBy('first_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Teachers/Form', ['teacher' => null]);
    }

    public function store(Request $request)
    {
        Teacher::create($this->validated($request));

        return redirect()->route('teachers.index')->with('success', 'Teacher created.');
    }

    public function edit(Teacher $teacher)
    {
        return Inertia::render('Teachers/Form', ['teacher' => $teacher]);
    }

    public function update(Request $request, Teacher $teacher)
    {
        $teacher->update($this->validated($request, $teacher->id));

        return redirect()->route('teachers.index')->with('success', 'Teacher updated.');
    }

    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return redirect()->route('teachers.index')->with('success', 'Teacher deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $institutionId = app('currentInstitution')->id ?? null;

        return $request->validate([
            'employee_id' => ['required', 'string', 'max:30', Rule::unique('teachers', 'employee_id')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:180', Rule::unique('teachers', 'email')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'phone' => ['nullable', 'string', 'max:30'],
            'designation' => ['nullable', 'string', 'max:80'],
            'qualification' => ['nullable', 'string', 'max:150'],
            'specialization' => ['nullable', 'string', 'max:150'],
            'joining_date' => ['nullable', 'date'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'address' => ['nullable', 'string'],
            'status' => ['required', 'in:active,on_leave,inactive'],
        ]);
    }
}
