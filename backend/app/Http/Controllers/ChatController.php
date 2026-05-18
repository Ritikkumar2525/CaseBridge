<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Complaint;
use App\Events\NewChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Chat Controller
 *
 * Real-time chat within complaint threads.
 */
class ChatController extends Controller
{
    /**
     * Get chat history for a complaint.
     *
     * GET /api/complaints/{id}/chat
     */
    public function index(string $id, Request $request): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);

        $messages = ChatMessage::where('complaint_id', $id)
            ->orderBy('created_at', 'asc')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Send a chat message.
     *
     * POST /api/complaints/{id}/chat
     */
    public function store(Request $request, string $id): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|min:1|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $chatMessage = ChatMessage::create([
            'complaint_id' => $id,
            'sender_id' => (string) $user->_id,
            'sender_name' => $user->name,
            'sender_role' => $user->role,
            'message' => $request->message,
        ]);

        // Broadcast the message in real-time
        try {
            event(new NewChatMessage($chatMessage));
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast chat message: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'data' => $chatMessage,
        ], 201);
    }
}
