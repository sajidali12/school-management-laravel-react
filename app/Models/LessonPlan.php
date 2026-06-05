<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class LessonPlan extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'teacher_id', 'section_id', 'subject_id',
        'title', 'description', 'file_path', 'file_name', 'week_start_date',
    ];

    protected $casts = ['week_start_date' => 'date'];

    protected $appends = ['file_url'];

    public function teacher(): BelongsTo { return $this->belongsTo(Teacher::class); }
    public function section(): BelongsTo { return $this->belongsTo(Section::class); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }
}
