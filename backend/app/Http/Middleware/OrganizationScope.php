<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Organization Scope Middleware
 *
 * Ensures users can only access data within their organization.
 * Super admins bypass this restriction.
 */
class OrganizationScope
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Super admins can access everything
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // For non-super-admin users, ensure they have an organization
        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not assigned to any organization.',
            ], 403);
        }

        // Store org_id in request for controllers to use
        $request->merge(['_organization_id' => $user->organization_id]);

        return $next($request);
    }
}
