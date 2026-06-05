<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'institution_id', 'role', 'is_active',
        'teacher_id', 'student_id',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function isSuperAdmin(): bool      { return $this->role === 'super_admin'; }
    public function isInstitutionAdmin(): bool { return $this->role === 'institution_admin'; }
    public function isTeacher(): bool          { return $this->role === 'teacher'; }
    public function isStudent(): bool          { return $this->role === 'student'; }

    public function dashboardRoute(): string
    {
        return match ($this->role) {
            'super_admin' => '/admin/institutions',
            'teacher'     => '/teacher/dashboard',
            'student'     => '/student/dashboard',
            default       => '/dashboard',
        };
    }
}
