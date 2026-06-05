<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffAttendance extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'teacher_id', 'date', 'status',
        'check_in_at', 'check_out_at', 'note', 'marked_by',
        'latitude', 'longitude',
    ];

    protected $casts = [
        'date'         => 'date',
        'check_in_at'  => 'datetime',
        'check_out_at' => 'datetime',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function getDurationAttribute(): ?string
    {
        if (! $this->check_in_at || ! $this->check_out_at) {
            return null;
        }

        $minutes = $this->check_in_at->diffInMinutes($this->check_out_at);
        $h       = intdiv($minutes, 60);
        $m       = $minutes % 60;

        return $h > 0 ? "{$h}h {$m}m" : "{$m}m";
    }
}
