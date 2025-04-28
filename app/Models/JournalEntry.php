<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'mood',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    /**
     * Get the metadata
     */
    public function getMetadataAttribute($value)
    {
        return json_decode($value, true) ?: [];
    }

    /**
     * Set the metadata
     */
    public function setMetadataAttribute($value)
    {
        $this->attributes['metadata'] = is_string($value) ? $value : json_encode($value ?: []);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
