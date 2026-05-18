<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Notification Controller
 *
 * In-app notification management.
 */
class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user.
     *
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $query = Notification::forUser((string) $user->_id)
            ->orderBy('created_at', 'desc');

        if ($request->has('unread_only') && $request->unread_only) {
            $query->unread();
        }

        $notifications = $query->paginate($request->input('per_page', 20));

        $unreadCount = Notification::forUser((string) $user->_id)->unread()->count();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a notification as read.
     *
     * PATCH /api/notifications/{id}/read
     */
    public function markAsRead(string $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark all notifications as read.
     *
     * PATCH /api/notifications/read-all
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = auth('api')->user();

        Notification::forUser((string) $user->_id)
            ->unread()
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }
}
