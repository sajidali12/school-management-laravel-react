<?php

namespace App\Http\Middleware;

use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $institution = app()->bound('currentInstitution') ? app('currentInstitution') : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'institution_id' => $user->institution_id,
                ] : null,
            ],
            'institution' => $institution instanceof Institution ? [
                'id' => $institution->id,
                'name' => $institution->name,
                'slug' => $institution->slug,
                'logo_url' => $institution->logoUrl(),
                'primary_color' => $institution->primary_color,
                'status' => $institution->status,
            ] : null,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
