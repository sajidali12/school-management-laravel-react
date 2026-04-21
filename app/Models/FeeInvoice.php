<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeInvoice extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'student_id', 'invoice_number', 'issue_date', 'due_date',
        'period', 'total_amount', 'paid_amount', 'status', 'notes',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(FeeInvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }

    public function refreshPaidStatus(): void
    {
        $paid = (float) $this->payments()->sum('amount');
        $total = (float) $this->total_amount;
        $status = match (true) {
            $paid <= 0 => (now()->gt($this->due_date) ? 'overdue' : 'pending'),
            $paid >= $total => 'paid',
            default => 'partial',
        };
        $this->forceFill(['paid_amount' => $paid, 'status' => $status])->save();
    }
}
