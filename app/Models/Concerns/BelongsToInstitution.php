<?php

namespace App\Models\Concerns;

use App\Models\Institution;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Scopes the model to the currently resolved tenant. Auto-stamps
 * institution_id on create. Super admins (no resolved tenant) see all rows.
 */
trait BelongsToInstitution
{
    public static function bootBelongsToInstitution(): void
    {
        static::addGlobalScope('institution', function (Builder $builder) {
            $institution = app()->bound('currentInstitution')
                ? app('currentInstitution')
                : null;

            if ($institution instanceof Institution) {
                $builder->where($builder->getModel()->getTable() . '.institution_id', $institution->id);
            }
        });

        static::creating(function (Model $model) {
            if (! $model->institution_id && app()->bound('currentInstitution')) {
                $model->institution_id = app('currentInstitution')->id;
            }
        });
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
