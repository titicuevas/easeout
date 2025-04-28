<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'color'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function journalEntries(): BelongsToMany
    {
        return $this->belongsToMany(JournalEntry::class);
    }
}
