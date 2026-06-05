<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAttendanceRecord extends Model
{
    protected $fillable = ['attendance_id', 'student_id', 'status', 'note'];

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(StudentAttendance::class, 'attendance_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
