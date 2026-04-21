<?php

namespace App\Http\Middleware;

use App\Models\Institution;
use Closure;
use Illuminate\Http\Request;

/**
 * Binds the current tenant into the container as `currentInstitution`.
 *
 * Priority:
 *   1. Authenticated user's institution (hard source of truth once logged in).
 *   2. `institution` route parameter — used for branded login URLs before auth.
 *   3. `i` query string — fallback for branded login URLs.
 *
 * Super admins (no institution_id) are left unbound, so they bypass tenant scopes.
 */
class ResolveInstitution
{
    public function handle(Request $request, Closure $next)
    {
        $institution = null;

        if (($user = $request->user()) && $user->institution_id) {
            $institution = $user->institution;
        } elseif ($slug = $request->route('institution') ?? $request->query('i')) {
            $institution = Institution::where('slug', $slug)->first();
        }

        if ($institution) {
            app()->instance('currentInstitution', $institution);
        }

        return $next($request);
    }
}
