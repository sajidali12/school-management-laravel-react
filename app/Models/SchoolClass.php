<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use BelongsToInstitution;

    protected $table = 'school_classes';

    protected $fillable = ['institution_id', 'name', 'level', 'description'];

    protected $casts = ['level' => 'integer'];

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_subject')
            ->withPivot('is_mandatory')
            ->withTimestamps();
    }

    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }
}
