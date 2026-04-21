<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $currentYear = (int) date('Y');

        $admissionTrend = collect(range($currentYear - 6, $currentYear))
            ->map(fn ($year) => [
                'year' => (string) $year,
                'total' => Student::where('admission_year', '<=', $year)->count(),
            ])->values();

        $classBreakdown = SchoolClass::withCount(['sections'])
            ->orderBy('level')
            ->orderBy('name')
            ->get(['id', 'name', 'level'])
            ->map(function ($class) {
                $studentCount = Student::whereIn('section_id', $class->sections()->pluck('id'))->count();

                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'sections_count' => $class->sections_count,
                    'students_count' => $studentCount,
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'classes' => SchoolClass::count(),
                'sections' => Section::count(),
                'teachers' => [
                    'active' => Teacher::where('status', 'active')->count(),
                    'total' => Teacher::count(),
                ],
                'students' => [
                    'active' => Student::where('status', 'active')->count(),
                    'total' => Student::count(),
                ],
                'subjects' => [
                    'active' => Subject::where('is_active', true)->count(),
                    'total' => Subject::count(),
                ],
            ],
            'admissionTrend' => $admissionTrend,
            'recentStudents' => Student::with(['section:id,name,school_class_id', 'section.schoolClass:id,name'])
                ->latest()
                ->limit(5)
                ->get(['id', 'roll_number', 'first_name', 'last_name', 'email', 'section_id', 'status']),
            'classBreakdown' => $classBreakdown,
        ]);
    }
}
