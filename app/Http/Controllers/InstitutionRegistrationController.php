<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionRegistrationController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Institutions/Register');
    }

    public function store(\Illuminate\Http\Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'institution_name' => 'required|string|max:120',
            'admin_name' => 'required|string|max:120',
            'admin_email' => 'required|email|max:180|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $institution = DB::transaction(function () use ($validated) {
            $institution = Institution::create([
                'name' => $validated['institution_name'],
                'slug' => $this->generateUniqueSlug($validated['institution_name']),
                'status' => 'pending',
            ]);

            User::create([
                'institution_id' => $institution->id,
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['password']),
                'role' => 'institution_admin',
                'is_active' => false,
                'email_verified_at' => now(),
            ]);

            return $institution;
        });

        return redirect()->route('institutions.pending', $institution);
    }

    public function pending(Institution $institution): Response
    {
        return Inertia::render('Institutions/Pending', [
            'institution' => [
                'name' => $institution->name,
                'status' => $institution->status,
            ],
        ]);
    }

    private function generateUniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'institution';
        $base = Str::limit($base, 40, '');
        $slug = $base;
        $suffix = 2;

        while (Institution::where('slug', $slug)->exists()) {
            $slug = Str::limit($base, 40 - strlen((string) $suffix) - 1, '')."-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
