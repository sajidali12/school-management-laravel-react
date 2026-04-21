<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $institution = $request->user()->institution;
        $user = $request->user();

        return Inertia::render('Settings/Institution', [
            'institution' => [
                'id' => $institution->id,
                'name' => $institution->name,
                'slug' => $institution->slug,
                'logo_url' => $institution->logoUrl(),
                'primary_color' => $institution->primary_color,
                'tagline' => $institution->tagline,
                'principal_name' => $institution->principal_name,
                'email' => $institution->email,
                'phone' => $institution->phone,
                'website' => $institution->website,
                'city' => $institution->city,
                'address' => $institution->address,
                'registration_number' => $institution->registration_number,
                'established_year' => $institution->established_year,
                'currency' => $institution->currency,
            ],
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function updateGeneral(Request $request): RedirectResponse
    {
        $institution = $request->user()->institution;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'primary_color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg,webp', 'max:2048'],
            'remove_logo' => ['nullable', 'boolean'],
            'currency' => ['required', 'string', 'max:6'],
        ]);

        if ($request->boolean('remove_logo') && $institution->logo_path) {
            Storage::disk('public')->delete($institution->logo_path);
            $institution->logo_path = null;
        }

        if ($request->hasFile('logo')) {
            if ($institution->logo_path) {
                Storage::disk('public')->delete($institution->logo_path);
            }
            $institution->logo_path = $request->file('logo')->store(
                "institutions/{$institution->id}",
                'public',
            );
        }

        $institution->fill([
            'name' => $validated['name'],
            'tagline' => $validated['tagline'] ?? null,
            'primary_color' => strtolower($validated['primary_color']),
            'currency' => strtoupper($validated['currency']),
        ])->save();

        return back()->with('success', 'General settings updated.');
    }

    public function updateContact(Request $request): RedirectResponse
    {
        $institution = $request->user()->institution;

        $validated = $request->validate([
            'email' => ['nullable', 'email', 'max:180'],
            'phone' => ['nullable', 'string', 'max:30'],
            'website' => ['nullable', 'url', 'max:180'],
            'city' => ['nullable', 'string', 'max:60'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $institution->update($validated);

        return back()->with('success', 'Contact details updated.');
    }

    public function updateAcademic(Request $request): RedirectResponse
    {
        $institution = $request->user()->institution;

        $validated = $request->validate([
            'principal_name' => ['nullable', 'string', 'max:120'],
            'registration_number' => ['nullable', 'string', 'max:60'],
            'established_year' => ['nullable', 'integer', 'min:1800', 'max:' . (int) date('Y')],
        ]);

        $institution->update($validated);

        return back()->with('success', 'Academic details updated.');
    }

    public function updateAccount(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->update($validated);

        return back()->with('success', 'Account updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated.');
    }
}
