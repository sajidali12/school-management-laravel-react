<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentPortalController extends Controller
{
    public function __invoke()
    {
        $user    = auth()->user();
        $student = $user->student()
            ->with(['section.schoolClass'])
            ->firstOrFail();

        $subjects = $student->section
            ? DB::table('class_subject')
                ->join('subjects', 'subjects.id', '=', 'class_subject.subject_id')
                ->where('class_subject.school_class_id', $student->section->school_class_id)
                ->where('subjects.is_active', true)
                ->select('subjects.id', 'subjects.name', 'subjects.code')
                ->orderBy('subjects.name')
                ->get()
            : collect();

        return Inertia::render('Student/Dashboard', [
            'student'  => $student,
            'subjects' => $subjects,
        ]);
    }
}
