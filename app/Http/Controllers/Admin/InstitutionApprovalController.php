<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionApprovalController extends Controller
{
    public function index(): Response
    {
        $institutions = Institution::query()
            ->withCount(['users', 'students', 'teachers'])
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'slug' => $i->slug,
                'status' => $i->status,
                'users_count' => $i->users_count,
                'students_count' => $i->students_count,
                'teachers_count' => $i->teachers_count,
                'created_at' => $i->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Institutions/Index', [
            'institutions' => $institutions,
        ]);
    }

    public function approve(Institution $institution): RedirectResponse
    {
        $institution->update(['status' => 'active']);
        $institution->users()->update(['is_active' => true]);

        return back()->with('success', "Activated {$institution->name}.");
    }

    public function reject(Institution $institution): RedirectResponse
    {
        $institution->users()->delete();
        $institution->delete();

        return back()->with('success', 'Institution rejected and removed.');
    }

    public function suspend(Institution $institution): RedirectResponse
    {
        $institution->update(['status' => 'suspended']);

        return back()->with('success', "Suspended {$institution->name}.");
    }
}
