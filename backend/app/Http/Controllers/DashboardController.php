<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Organization;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Dashboard Controller
 *
 * Provides role-aware statistics, chart data, and activity feeds.
 */
class DashboardController extends Controller
{
    /**
     * Get dashboard statistics (role-aware).
     *
     * GET /api/dashboard/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        if ($user->isSuperAdmin()) {
            return $this->superAdminStats();
        } elseif ($user->isOrgAdmin()) {
            return $this->orgAdminStats($user);
        } elseif ($user->isStaff()) {
            return $this->staffStats($user);
        } else {
            return $this->userStats($user);
        }
    }

    /**
     * Get chart data for visualizations.
     *
     * GET /api/dashboard/charts
     */
    public function charts(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $orgId = $user->isSuperAdmin() ? $request->organization_id : $user->organization_id;

        $query = Complaint::query();
        if ($orgId) {
            $query->where('organization_id', $orgId);
        }

        // Status distribution
        $statusDistribution = [];
        foreach (Complaint::STATUSES as $status) {
            $statusDistribution[] = [
                'name' => $status,
                'value' => (clone $query)->where('status', $status)->count(),
            ];
        }

        // Priority distribution
        $priorityDistribution = [];
        foreach (Complaint::PRIORITIES as $priority) {
            $priorityDistribution[] = [
                'name' => ucfirst($priority),
                'value' => (clone $query)->where('priority', $priority)->count(),
            ];
        }

        // Trend data (last 30 days)
        $trendData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayStart = $date->startOfDay()->toDateTime();
            $dayEnd = $date->endOfDay()->toDateTime();

            $trendData[] = [
                'date' => $date->format('M d'),
                'complaints' => (clone $query)
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count(),
                'resolved' => (clone $query)
                    ->where('status', 'RESOLVED')
                    ->whereBetween('resolved_at', [$dayStart, $dayEnd])
                    ->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'status_distribution' => $statusDistribution,
                'priority_distribution' => $priorityDistribution,
                'trend_data' => $trendData,
            ],
        ]);
    }

    /**
     * Get recent activity feed.
     *
     * GET /api/dashboard/recent
     */
    public function recent(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $query = Complaint::query();

        if ($user->isSuperAdmin()) {
            // All recent complaints
        } elseif ($user->isOrgAdmin() || $user->isStaff()) {
            $query->where('organization_id', $user->organization_id);
        } else {
            $query->where('user_id', (string) $user->_id);
        }

        $recent = $query->with(['user:name,email', 'assignedStaff:name,email'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $recent,
        ]);
    }

    // ─── Private Stats Methods ───────────────────────────────────

    private function superAdminStats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_organizations' => Organization::count(),
                'active_organizations' => Organization::where('is_active', true)->count(),
                'total_users' => User::count(),
                'total_complaints' => Complaint::count(),
                'open_complaints' => Complaint::whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
                'resolved_complaints' => Complaint::where('status', 'RESOLVED')->count(),
                'closed_complaints' => Complaint::where('status', 'CLOSED')->count(),
                'high_priority' => Complaint::where('priority', 'high')
                    ->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
                'escalated' => Complaint::where('status', 'ESCALATED')->count(),
            ],
        ]);
    }

    private function orgAdminStats($user): JsonResponse
    {
        $orgId = $user->organization_id;

        return response()->json([
            'success' => true,
            'data' => [
                'total_staff' => User::where('organization_id', $orgId)
                    ->whereIn('role', ['staff', 'org_admin'])->count(),
                'total_users' => User::where('organization_id', $orgId)->count(),
                'total_complaints' => Complaint::where('organization_id', $orgId)->count(),
                'open_complaints' => Complaint::where('organization_id', $orgId)
                    ->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
                'resolved_complaints' => Complaint::where('organization_id', $orgId)
                    ->where('status', 'RESOLVED')->count(),
                'unassigned' => Complaint::where('organization_id', $orgId)
                    ->where('status', 'CREATED')->count(),
                'high_priority' => Complaint::where('organization_id', $orgId)
                    ->where('priority', 'high')
                    ->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
                'escalated' => Complaint::where('organization_id', $orgId)
                    ->where('status', 'ESCALATED')->count(),
            ],
        ]);
    }

    private function staffStats($user): JsonResponse
    {
        $userId = (string) $user->_id;

        return response()->json([
            'success' => true,
            'data' => [
                'assigned_to_me' => Complaint::where('assigned_staff_id', $userId)->count(),
                'in_progress' => Complaint::where('assigned_staff_id', $userId)
                    ->where('status', 'IN_PROGRESS')->count(),
                'resolved_by_me' => Complaint::where('assigned_staff_id', $userId)
                    ->where('status', 'RESOLVED')->count(),
                'pending' => Complaint::where('assigned_staff_id', $userId)
                    ->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
                'high_priority' => Complaint::where('assigned_staff_id', $userId)
                    ->where('priority', 'high')
                    ->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
            ],
        ]);
    }

    private function userStats($user): JsonResponse
    {
        $userId = (string) $user->_id;

        return response()->json([
            'success' => true,
            'data' => [
                'total_complaints' => Complaint::where('user_id', $userId)->count(),
                'open_complaints' => Complaint::where('user_id', $userId)
                    ->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
                'resolved_complaints' => Complaint::where('user_id', $userId)
                    ->where('status', 'RESOLVED')->count(),
                'closed_complaints' => Complaint::where('user_id', $userId)
                    ->where('status', 'CLOSED')->count(),
                'unread_notifications' => Notification::forUser($userId)->unread()->count(),
            ],
        ]);
    }
}
