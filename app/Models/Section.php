<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'school_class_id', 'class_teacher_id', 'name', 'room', 'capacity',
    ];

    protected $casts = ['capacity' => 'integer'];

    protected $appends = ['full_name'];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'class_teacher_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(
            fn () => trim(($this->schoolClass?->name ?? '') . ' - ' . $this->name)
        );
    }
}
