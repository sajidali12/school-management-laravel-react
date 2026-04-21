<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'name', 'type', 'account_number',
        'bank_name', 'opening_balance', 'is_active',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['current_balance'];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    protected function currentBalance(): Attribute
    {
        return Attribute::get(function () {
            $income = (float) $this->transactions()->where('type', 'income')->sum('amount');
            $expense = (float) $this->transactions()->where('type', 'expense')->sum('amount');

            return (float) $this->opening_balance + $income - $expense;
        });
    }
}
