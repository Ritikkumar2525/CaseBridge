<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Chat Message Model
 *
 * Real-time chat messages within a complaint thread.
 */
class ChatMessage extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'chat_messages';

    protected $fillable = [
        'complaint_id',
        'sender_id',
        'sender_name',
        'sender_role',
        'message',
        'attachments',
    ];

    protected function casts(): array
    {
        return [];
    }

    protected $attributes = [];

    // ─── Relationships ───────────────────────────────────────────

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
