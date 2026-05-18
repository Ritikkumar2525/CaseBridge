<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast when a new chat message is sent in a complaint thread.
 */
class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ChatMessage $chatMessage,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('complaint.' . $this->chatMessage->complaint_id . '.chat'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.message.new';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => (string) $this->chatMessage->_id,
            'complaint_id' => $this->chatMessage->complaint_id,
            'sender_id' => $this->chatMessage->sender_id,
            'sender_name' => $this->chatMessage->sender_name,
            'sender_role' => $this->chatMessage->sender_role,
            'message' => $this->chatMessage->message,
            'created_at' => $this->chatMessage->created_at?->toISOString(),
        ];
    }
}
