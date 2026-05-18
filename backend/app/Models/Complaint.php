<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Complaint Model
 *
 * Core entity of the CaseBridge system.
 * Tracks the full lifecycle: CREATED → ASSIGNED → IN_PROGRESS → ESCALATED → RESOLVED → CLOSED
 */
class Complaint extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'complaints';

    /**
     * Valid status transitions (lifecycle)
     */
    public const STATUS_TRANSITIONS = [
        'CREATED' => ['ASSIGNED', 'CLOSED'],
        'ASSIGNED' => ['IN_PROGRESS', 'CREATED', 'CLOSED'],
        'IN_PROGRESS' => ['ESCALATED', 'RESOLVED', 'CLOSED'],
        'ESCALATED' => ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        'RESOLVED' => ['CLOSED', 'IN_PROGRESS'],
        'CLOSED' => [],
    ];

    public const STATUSES = ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
    public const PRIORITIES = ['low', 'medium', 'high'];

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'category',
        'organization_id',
        'user_id',
        'assigned_staff_id',
        'attachments',
        'comments',
        'status_history',
        'resolved_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    protected $attributes = [
        'status' => 'CREATED',
        'priority' => 'medium',
    ];

    // ─── Relationships ───────────────────────────────────────────

    /**
     * Get the user who submitted this complaint.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the organization this complaint belongs to.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the assigned staff member.
     */
    public function assignedStaff()
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    /**
     * Get chat messages for this complaint.
     */
    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeAssignedTo($query, $staffId)
    {
        return $query->where('assigned_staff_id', $staffId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * Check if a status transition is valid.
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $allowed = self::STATUS_TRANSITIONS[$this->status] ?? [];
        return in_array($newStatus, $allowed);
    }

    /**
     * Add a comment to the complaint.
     */
    public function addComment(string $userId, string $userName, string $content): void
    {
        $comments = $this->comments ?? [];
        $comments[] = [
            '_id' => (string) new \MongoDB\BSON\ObjectId(),
            'user_id' => $userId,
            'user_name' => $userName,
            'content' => $content,
            'created_at' => now()->toISOString(),
        ];
        $this->comments = $comments;
    }

    /**
     * Add a status history entry.
     */
    public function addStatusHistory(string $from, string $to, string $changedBy, ?string $note = null): void
    {
        $history = $this->status_history ?? [];
        $history[] = [
            'from' => $from,
            'to' => $to,
            'changed_by' => $changedBy,
            'note' => $note,
            'changed_at' => now()->toISOString(),
        ];
        $this->status_history = $history;
    }
}
