<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'employee_id', 'first_name', 'last_name', 'email', 'phone',
        'designation', 'qualification', 'specialization', 'joining_date', 'date_of_birth',
        'gender', 'address', 'status',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'date_of_birth' => 'date',
    ];

    protected $appends = ['full_name'];

    public function classSections(): HasMany
    {
        return $this->hasMany(Section::class, 'class_teacher_id');
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim("{$this->first_name} {$this->last_name}"));
    }
}
