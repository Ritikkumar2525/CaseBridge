<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Notification;
use App\Services\ComplaintService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

/**
 * Complaint Controller
 *
 * Full CRUD + lifecycle management for complaints.
 */
class ComplaintController extends Controller
{
    public function __construct(
        private ComplaintService $complaintService
    ) {}

    /**
     * List complaints (scoped by role and organization).
     *
     * GET /api/complaints
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $query = Complaint::query();

        // Role-based scoping
        if ($user->isSuperAdmin()) {
            // Super admin sees all — optionally filter by org
            if ($request->has('organization_id')) {
                $query->byOrganization($request->organization_id);
            }
        } elseif ($user->isOrgAdmin()) {
            // Org admin sees all in their organization
            $query->byOrganization($user->organization_id);
        } elseif ($user->isStaff()) {
            // Staff sees assigned complaints
            $query->where(function ($q) use ($user) {
                $q->assignedTo((string) $user->_id)
                  ->orWhere('organization_id', $user->organization_id);
            });
        } else {
            // Regular user sees only their own
            $query->byUser((string) $user->_id);
        }

        // Filters
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }
        if ($request->has('priority')) {
            $query->byPriority($request->priority);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $complaints = $query->with(['user:name,email,avatar', 'assignedStaff:name,email,avatar'])
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $complaints,
        ]);
    }

    /**
     * Create a new complaint.
     *
     * POST /api/complaints
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:5|max:200',
            'description' => 'required|string|min:10|max:5000',
            'priority' => 'sometimes|in:low,medium,high',
            'category' => 'sometimes|string|max:100',
            'organization_id' => 'sometimes|string',
            'attachments' => 'sometimes|array|max:5',
            'attachments.*' => 'file|max:10240', // 10MB per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Handle file uploads
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('complaints/attachments', 'public');
                $attachments[] = [
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }
        }

        $orgId = $request->organization_id ?? $user->organization_id;

        $complaint = Complaint::create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->input('priority', 'medium'),
            'category' => $request->category,
            'organization_id' => $orgId,
            'user_id' => (string) $user->_id,
            'attachments' => $attachments,
            'status' => 'CREATED',
        ]);

        // Notify org admins
        $this->notifyOrgAdmins($complaint);

        return response()->json([
            'success' => true,
            'message' => 'Complaint submitted successfully.',
            'data' => $complaint->load('user:name,email'),
        ], 201);
    }

    /**
     * Get complaint details.
     *
     * GET /api/complaints/{id}
     */
    public function show(string $id): JsonResponse
    {
        $complaint = Complaint::with(['user:name,email,avatar', 'assignedStaff:name,email,avatar', 'organization:name'])
            ->findOrFail($id);

        $user = auth('api')->user();

        // Access control
        if (!$this->canAccessComplaint($user, $complaint)) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $complaint,
        ]);
    }

    /**
     * Update a complaint.
     *
     * PUT /api/complaints/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);
        $user = auth('api')->user();

        if (!$this->canAccessComplaint($user, $complaint)) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|min:5|max:200',
            'description' => 'sometimes|string|min:10|max:5000',
            'priority' => 'sometimes|in:low,medium,high',
            'category' => 'sometimes|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $complaint->update($request->only(['title', 'description', 'priority', 'category']));

        return response()->json([
            'success' => true,
            'message' => 'Complaint updated.',
            'data' => $complaint->fresh(),
        ]);
    }

    /**
     * Change complaint status (lifecycle).
     *
     * PATCH /api/complaints/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:' . implode(',', Complaint::STATUSES),
            'note' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $complaint = $this->complaintService->transitionStatus(
                $complaint,
                $request->status,
                (string) auth('api')->id(),
                $request->note
            );

            return response()->json([
                'success' => true,
                'message' => "Complaint status updated to {$request->status}.",
                'data' => $complaint,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Assign complaint to staff.
     *
     * PATCH /api/complaints/{id}/assign
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $complaint = $this->complaintService->assignToStaff(
            $complaint,
            $request->staff_id,
            (string) auth('api')->id()
        );

        return response()->json([
            'success' => true,
            'message' => 'Complaint assigned to staff.',
            'data' => $complaint->load('assignedStaff:name,email'),
        ]);
    }

    /**
     * Add a comment to a complaint.
     *
     * POST /api/complaints/{id}/comments
     */
    public function addComment(Request $request, string $id): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);
        $user = auth('api')->user();

        if (!$this->canAccessComplaint($user, $complaint)) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|min:1|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $complaint->addComment(
            (string) $user->_id,
            $user->name,
            $request->content
        );
        $complaint->save();

        // Notify complaint owner if commenter is different
        if ((string) $user->_id !== $complaint->user_id) {
            Notification::create([
                'user_id' => $complaint->user_id,
                'organization_id' => $complaint->organization_id,
                'type' => 'comment_added',
                'title' => 'New Comment on Your Complaint',
                'message' => "{$user->name} commented on \"{$complaint->title}\".",
                'data' => ['complaint_id' => (string) $complaint->_id],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Comment added.',
            'data' => $complaint->fresh(),
        ]);
    }

    /**
     * Delete a complaint.
     *
     * DELETE /api/complaints/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);
        $user = auth('api')->user();

        // Only the creator or admins can delete
        if (!$user->isSuperAdmin() && !$user->isOrgAdmin() && (string) $user->_id !== $complaint->user_id) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $complaint->delete();

        return response()->json([
            'success' => true,
            'message' => 'Complaint deleted.',
        ]);
    }

    // ─── Private Helpers ─────────────────────────────────────────

    /**
     * Check if user can access a complaint.
     */
    private function canAccessComplaint($user, Complaint $complaint): bool
    {
        if ($user->isSuperAdmin()) return true;
        if ((string) $user->_id === $complaint->user_id) return true;
        if ((string) $user->_id === $complaint->assigned_staff_id) return true;
        if ($user->organization_id === $complaint->organization_id &&
            in_array($user->role, ['org_admin', 'staff'])) return true;
        return false;
    }

    /**
     * Notify organization admins about new complaint.
     */
    private function notifyOrgAdmins(Complaint $complaint): void
    {
        try {
            $admins = \App\Models\User::where('organization_id', $complaint->organization_id)
                ->whereIn('role', ['org_admin'])
                ->get();

            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => (string) $admin->_id,
                    'organization_id' => $complaint->organization_id,
                    'type' => 'complaint_created',
                    'title' => 'New Complaint Received',
                    'message' => "New complaint: \"{$complaint->title}\" (Priority: {$complaint->priority})",
                    'data' => ['complaint_id' => (string) $complaint->_id],
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to notify org admins: ' . $e->getMessage());
        }
    }
}
