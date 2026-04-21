<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'code', 'name', 'description', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subject')
            ->withPivot('is_mandatory')
            ->withTimestamps();
    }
}
