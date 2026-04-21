<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeCategory extends Model
{
    use BelongsToInstitution;

    protected $fillable = ['institution_id', 'name', 'description', 'frequency', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function structures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }
}
