<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingController extends Controller
{
    public function edit(Request $request): Response
    {
        $institution = $request->user()->institution;

        return Inertia::render('Settings/Branding', [
            'institution' => [
                'name' => $institution->name,
                'slug' => $institution->slug,
                'logo_url' => $institution->logoUrl(),
                'primary_color' => $institution->primary_color,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $institution = $request->user()->institution;

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'primary_color' => 'required|regex:/^#[0-9a-fA-F]{6}$/',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'remove_logo' => 'nullable|boolean',
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
                'public'
            );
        }

        $institution->name = $validated['name'];
        $institution->primary_color = strtolower($validated['primary_color']);
        $institution->save();

        return back()->with('success', 'Branding updated.');
    }
}
