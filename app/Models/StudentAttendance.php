<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentAttendance extends Model
{
    use BelongsToInstitution;

    protected $fillable = ['institution_id', 'section_id', 'teacher_id', 'date'];

    protected $casts = ['date' => 'date'];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function records(): HasMany
    {
        return $this->hasMany(StudentAttendanceRecord::class, 'attendance_id');
    }
}
