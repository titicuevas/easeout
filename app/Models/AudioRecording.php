<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AudioRecording extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'file_path',
        'duration',
        'mood',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'duration' => 'integer'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
