<?php

namespace App\Events;

use App\Models\Complaint;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast when a complaint's status changes.
 */
class ComplaintStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Complaint $complaint,
        public string $oldStatus,
        public string $newStatus,
    ) {}

    /**
     * Broadcast on org-specific and user-specific channels.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organization.' . $this->complaint->organization_id),
            new PrivateChannel('user.' . $this->complaint->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'complaint.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'complaint_id' => (string) $this->complaint->_id,
            'title' => $this->complaint->title,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'priority' => $this->complaint->priority,
            'updated_at' => now()->toISOString(),
        ];
    }
}
