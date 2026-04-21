<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'section_id', 'roll_number', 'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'gender', 'guardian_name', 'guardian_phone', 'address',
        'admission_year', 'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'admission_year' => 'integer',
    ];

    protected $appends = ['full_name'];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(FeeInvoice::class);
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim("{$this->first_name} {$this->last_name}"));
    }
}
