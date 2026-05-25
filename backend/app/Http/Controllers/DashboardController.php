<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Organization;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
        $cacheKey = 'dashboard_stats_' . $user->_id;

        $data = Cache::remember($cacheKey, 30, function () use ($user) {
            if ($user->isSuperAdmin()) {
                return $this->superAdminStatsData();
            } elseif ($user->isOrgAdmin()) {
                return $this->orgAdminStatsData($user);
            } elseif ($user->isStaff()) {
                return $this->staffStatsData($user);
            } else {
                return $this->userStatsData($user);
            }
        });

        return response()->json(['success' => true, 'data' => $data]);
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
        $cacheKey = 'dashboard_charts_' . ($orgId ?? 'all') . '_' . $user->_id;

        $data = Cache::remember($cacheKey, 60, function () use ($orgId) {
            $query = Complaint::query();
            if ($orgId) {
                $query->where('organization_id', $orgId);
            }

            // Status distribution — single query using groupBy
            $statusCounts = (clone $query)
                ->raw(function ($collection) use ($orgId) {
                    $pipeline = [];
                    if ($orgId) {
                        $pipeline[] = ['$match' => ['organization_id' => $orgId]];
                    }
                    $pipeline[] = ['$group' => ['_id' => '$status', 'count' => ['$sum' => 1]]];
                    return $collection->aggregate($pipeline);
                });

            $statusMap = [];
            foreach ($statusCounts as $row) {
                $statusMap[$row['_id']] = $row['count'];
            }

            $statusDistribution = [];
            foreach (Complaint::STATUSES as $status) {
                $statusDistribution[] = [
                    'name' => $status,
                    'value' => $statusMap[$status] ?? 0,
                ];
            }

            // Priority distribution — single query
            $priorityCounts = (clone $query)
                ->raw(function ($collection) use ($orgId) {
                    $pipeline = [];
                    if ($orgId) {
                        $pipeline[] = ['$match' => ['organization_id' => $orgId]];
                    }
                    $pipeline[] = ['$group' => ['_id' => '$priority', 'count' => ['$sum' => 1]]];
                    return $collection->aggregate($pipeline);
                });

            $priorityMap = [];
            foreach ($priorityCounts as $row) {
                $priorityMap[$row['_id']] = $row['count'];
            }

            $priorityDistribution = [];
            foreach (Complaint::PRIORITIES as $priority) {
                $priorityDistribution[] = [
                    'name' => ucfirst($priority),
                    'value' => $priorityMap[$priority] ?? 0,
                ];
            }

            // Trend data (last 30 days) — two aggregation queries instead of 60 individual counts
            $thirtyDaysAgo = now()->subDays(30)->startOfDay()->toDateTime();

            // Complaints created per day
            $createdTrend = (clone $query)
                ->raw(function ($collection) use ($orgId, $thirtyDaysAgo) {
                    $pipeline = [];
                    $matchStage = ['created_at' => ['$gte' => $thirtyDaysAgo]];
                    if ($orgId) {
                        $matchStage['organization_id'] = $orgId;
                    }
                    $pipeline[] = ['$match' => $matchStage];
                    $pipeline[] = ['$group' => [
                        '_id' => ['$dateToString' => ['format' => '%Y-%m-%d', 'date' => '$created_at']],
                        'count' => ['$sum' => 1],
                    ]];
                    return $collection->aggregate($pipeline);
                });

            $createdMap = [];
            foreach ($createdTrend as $row) {
                $createdMap[$row['_id']] = $row['count'];
            }

            // Resolved per day
            $resolvedTrend = (clone $query)
                ->raw(function ($collection) use ($orgId, $thirtyDaysAgo) {
                    $pipeline = [];
                    $matchStage = [
                        'status' => 'RESOLVED',
                        'resolved_at' => ['$gte' => $thirtyDaysAgo],
                    ];
                    if ($orgId) {
                        $matchStage['organization_id'] = $orgId;
                    }
                    $pipeline[] = ['$match' => $matchStage];
                    $pipeline[] = ['$group' => [
                        '_id' => ['$dateToString' => ['format' => '%Y-%m-%d', 'date' => '$resolved_at']],
                        'count' => ['$sum' => 1],
                    ]];
                    return $collection->aggregate($pipeline);
                });

            $resolvedMap = [];
            foreach ($resolvedTrend as $row) {
                $resolvedMap[$row['_id']] = $row['count'];
            }

            $trendData = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dateKey = $date->format('Y-m-d');
                $trendData[] = [
                    'date' => $date->format('M d'),
                    'complaints' => $createdMap[$dateKey] ?? 0,
                    'resolved' => $resolvedMap[$dateKey] ?? 0,
                ];
            }

            return [
                'status_distribution' => $statusDistribution,
                'priority_distribution' => $priorityDistribution,
                'trend_data' => $trendData,
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Get recent activity feed.
     *
     * GET /api/dashboard/recent
     */
    public function recent(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $cacheKey = 'dashboard_recent_' . $user->_id;

        $data = Cache::remember($cacheKey, 30, function () use ($user) {
            $query = Complaint::query();

            if ($user->isSuperAdmin()) {
                // All recent complaints
            } elseif ($user->isOrgAdmin() || $user->isStaff()) {
                $query->where('organization_id', $user->organization_id);
            } else {
                $query->where('user_id', (string) $user->_id);
            }

            return $query->with(['user:name,email', 'assignedStaff:name,email'])
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->toArray();
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    // ─── Private Stats Methods ───────────────────────────────────

    private function superAdminStatsData(): array
    {
        return [
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
        ];
    }

    private function orgAdminStatsData($user): array
    {
        $orgId = $user->organization_id;

        return [
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
        ];
    }

    private function staffStatsData($user): array
    {
        $userId = (string) $user->_id;

        return [
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
        ];
    }

    private function userStatsData($user): array
    {
        $userId = (string) $user->_id;

        return [
            'total_complaints' => Complaint::where('user_id', $userId)->count(),
            'open_complaints' => Complaint::where('user_id', $userId)
                ->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count(),
            'resolved_complaints' => Complaint::where('user_id', $userId)
                ->where('status', 'RESOLVED')->count(),
            'closed_complaints' => Complaint::where('user_id', $userId)
                ->where('status', 'CLOSED')->count(),
            'unread_notifications' => Notification::forUser($userId)->unread()->count(),
        ];
    }
}
