<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Organization Controller
 *
 * Manages organizations (CRUD) and user assignments.
 */
class OrganizationController extends Controller
{
    /**
     * List organizations.
     * Super admin sees all; org_admin sees their own.
     *
     * GET /api/organizations
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $query = Organization::query();

        // Non-super-admins only see their organization
        if (!$user->isSuperAdmin()) {
            $query->where('_id', $user->organization_id);
        }

        // Filters
        if ($request->has('type')) {
            $query->byType($request->type);
        }
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $organizations = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $organizations,
        ]);
    }

    /**
     * List active organizations publicly (only id and name for dropdown).
     *
     * GET /api/organizations/public
     */
    public function publicList(): JsonResponse
    {
        $organizations = Organization::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get(['_id', 'name']);

        // Format to map _id as id
        $formatted = $organizations->map(function ($org) {
            return [
                'id' => (string) $org->_id,
                '_id' => (string) $org->_id,
                'name' => $org->name,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $formatted
            ],
        ]);
    }

    /**
     * Create a new organization.
     * Super admin only.
     *
     * POST /api/organizations
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:200',
            'type' => 'required|in:college,hospital,office,society,other',
            'description' => 'sometimes|string|max:1000',
            'contact_email' => 'required|email',
            'contact_phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
            'logo' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $organization = Organization::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(4),
            'type' => $request->type,
            'description' => $request->description,
            'contact_email' => $request->contact_email,
            'contact_phone' => $request->contact_phone,
            'address' => $request->address,
            'logo' => $request->logo,
            'created_by' => (string) auth('api')->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Organization created successfully.',
            'data' => $organization,
        ], 201);
    }

    /**
     * Get organization details.
     *
     * GET /api/organizations/{id}
     */
    public function show(string $id): JsonResponse
    {
        $organization = Organization::findOrFail($id);
        $user = auth('api')->user();

        // Non-super-admins can only view their own organization
        if (!$user->isSuperAdmin() && (string) $user->organization_id !== (string) $organization->_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        $organization->users_count = $organization->users()->count();
        $organization->complaints_count = $organization->complaints()->count();

        return response()->json([
            'success' => true,
            'data' => $organization,
        ]);
    }

    /**
     * Update an organization.
     *
     * PUT /api/organizations/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $organization = Organization::findOrFail($id);
        $user = auth('api')->user();

        if (!$user->isSuperAdmin() && !$user->isOrgAdmin()) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|min:2|max:200',
            'type' => 'sometimes|in:college,hospital,office,society,other',
            'description' => 'sometimes|string|max:1000',
            'contact_email' => 'sometimes|email',
            'contact_phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
            'logo' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'settings' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $organization->update($request->only([
            'name', 'type', 'description', 'contact_email',
            'contact_phone', 'address', 'logo', 'is_active', 'settings',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Organization updated.',
            'data' => $organization->fresh(),
        ]);
    }

    /**
     * Delete (soft-deactivate) an organization.
     *
     * DELETE /api/organizations/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $organization = Organization::findOrFail($id);
        
        // Optionally, we could delete associated users/complaints here.
        // For now, we will perform a hard delete on the organization itself.
        $organization->delete();

        return response()->json([
            'success' => true,
            'message' => 'Organization removed successfully.',
        ]);
    }

    /**
     * Assign a user to an organization.
     *
     * POST /api/organizations/{id}/users
     */
    public function assignUser(Request $request, string $id): JsonResponse
    {
        $organization = Organization::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|string',
            'role' => 'sometimes|in:user,staff,org_admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::findOrFail($request->user_id);
        $user->update([
            'organization_id' => (string) $organization->_id,
            'role' => $request->input('role', $user->role),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User assigned to organization.',
            'data' => $user->fresh(),
        ]);
    }

    /**
     * List staff members of an organization.
     *
     * GET /api/organizations/{id}/staff
     */
    public function getStaff(string $id): JsonResponse
    {
        $organization = Organization::findOrFail($id);
        $staff = User::where('organization_id', (string) $organization->_id)
            ->whereIn('role', ['staff', 'org_admin'])
            ->active()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    /**
     * Get organization statistics.
     *
     * GET /api/organizations/{id}/stats
     */
    public function getStats(string $id): JsonResponse
    {
        $organization = Organization::findOrFail($id);
        $orgId = (string) $organization->_id;

        $stats = [
            'total_users' => User::where('organization_id', $orgId)->count(),
            'total_staff' => User::where('organization_id', $orgId)->whereIn('role', ['staff', 'org_admin'])->count(),
            'total_complaints' => \App\Models\Complaint::where('organization_id', $orgId)->count(),
            'complaints_by_status' => [],
            'complaints_by_priority' => [],
        ];

        // Aggregate complaints by status
        foreach (\App\Models\Complaint::STATUSES as $status) {
            $stats['complaints_by_status'][$status] = \App\Models\Complaint::where('organization_id', $orgId)
                ->where('status', $status)->count();
        }

        // Aggregate complaints by priority
        foreach (\App\Models\Complaint::PRIORITIES as $priority) {
            $stats['complaints_by_priority'][$priority] = \App\Models\Complaint::where('organization_id', $orgId)
                ->where('priority', $priority)->count();
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
