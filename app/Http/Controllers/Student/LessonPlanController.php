<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LessonPlan;
use App\Models\Subject;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class LessonPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $student   = auth()->user()->student()->with('section')->firstOrFail();
        $subjectId = $request->integer('subject_id') ?: null;

        $plans = LessonPlan::where('section_id', $student->section_id)
            ->with(['subject', 'teacher'])
            ->when($subjectId, fn ($q) => $q->where('subject_id', $subjectId))
            ->orderByDesc('week_start_date')
            ->paginate(15)
            ->withQueryString();

        $subjects = Subject::whereHas('classes', fn ($q) => $q->where('school_classes.id', $student->section->school_class_id))
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('Student/LessonPlans', [
            'plans'    => $plans,
            'subjects' => $subjects,
            'filters'  => ['subject_id' => $subjectId],
        ]);
    }
}
