<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class AssignmentSubmission extends Model
{
    protected $fillable = [
        'assignment_id', 'student_id', 'file_path', 'file_name',
        'submitted_at', 'marks', 'feedback', 'status',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'marks'        => 'decimal:2',
    ];

    protected $appends = ['file_url'];

    public function assignment(): BelongsTo { return $this->belongsTo(Assignment::class); }
    public function student(): BelongsTo   { return $this->belongsTo(Student::class); }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }
}
