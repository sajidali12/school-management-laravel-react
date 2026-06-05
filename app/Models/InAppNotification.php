<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InAppNotification extends Model
{
    use BelongsToInstitution;

    protected $fillable = [
        'institution_id', 'user_id', 'type', 'title', 'message', 'url', 'read_at',
    ];

    protected $casts = ['read_at' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public static function send(int $userId, int $institutionId, string $type, string $title, string $message, ?string $url = null): void
    {
        static::create([
            'institution_id' => $institutionId,
            'user_id'        => $userId,
            'type'           => $type,
            'title'          => $title,
            'message'        => $message,
            'url'            => $url,
        ]);
    }

    public static function broadcast(array $userIds, int $institutionId, string $type, string $title, string $message, ?string $url = null): void
    {
        if (empty($userIds)) return;

        $rows = array_map(fn ($uid) => [
            'institution_id' => $institutionId,
            'user_id'        => $uid,
            'type'           => $type,
            'title'          => $title,
            'message'        => $message,
            'url'            => $url,
            'read_at'        => null,
            'created_at'     => now(),
            'updated_at'     => now(),
        ], $userIds);

        static::insert($rows);
    }
}
