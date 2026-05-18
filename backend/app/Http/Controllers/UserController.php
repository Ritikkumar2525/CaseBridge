<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * User Controller
 *
 * Admin user management
 */
class UserController extends Controller
{
    /**
     * List users (admin only, filterable).
     *
     * GET /api/users
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $query = User::query();

        if ($user->isOrgAdmin()) {
            $query->where('organization_id', $user->organization_id);
        }

        if ($request->has('role')) {
            $query->byRole($request->role);
        }
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Update a user.
     *
     * PUT /api/users/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $targetUser = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|min:2|max:100',
            'role' => 'sometimes|in:user,staff,org_admin,super_admin',
            'organization_id' => 'sometimes|string|nullable',
            'is_active' => 'sometimes|boolean',
            'phone' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetUser->update($request->only([
            'name', 'role', 'organization_id', 'is_active', 'phone',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'User updated.',
            'data' => $targetUser->fresh(),
        ]);
    }

    /**
     * Get a specific user.
     *
     * GET /api/users/{id}
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with('organization')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }
}
