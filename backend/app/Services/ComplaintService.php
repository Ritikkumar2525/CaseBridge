<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Notification;
use App\Events\ComplaintStatusUpdated;
use Illuminate\Support\Facades\Log;

/**
 * Complaint Service
 *
 * Business logic layer for complaint operations.
 * Handles status transitions, notifications, and validation.
 */
class ComplaintService
{
    /**
     * Transition a complaint to a new status.
     *
     * @throws \InvalidArgumentException
     */
    public function transitionStatus(
        Complaint $complaint,
        string $newStatus,
        string $changedBy,
        ?string $note = null
    ): Complaint {
        // Validate the transition
        if (!$complaint->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Cannot transition from {$complaint->status} to {$newStatus}. " .
                "Allowed: " . implode(', ', Complaint::STATUS_TRANSITIONS[$complaint->status] ?? [])
            );
        }

        $oldStatus = $complaint->status;

        // Update status
        $complaint->status = $newStatus;

        // Set timestamps for terminal states
        if ($newStatus === 'RESOLVED') {
            $complaint->resolved_at = now();
        } elseif ($newStatus === 'CLOSED') {
            $complaint->closed_at = now();
        }

        // Add history entry
        $complaint->addStatusHistory($oldStatus, $newStatus, $changedBy, $note);
        $complaint->save();

        // Broadcast the status change
        try {
            event(new ComplaintStatusUpdated($complaint, $oldStatus, $newStatus));
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast complaint status update: ' . $e->getMessage());
        }

        // Create notification for the complaint owner
        $this->notifyStatusChange($complaint, $oldStatus, $newStatus);

        return $complaint;
    }

    /**
     * Assign a complaint to a staff member.
     */
    public function assignToStaff(Complaint $complaint, string $staffId, string $assignedBy): Complaint
    {
        $complaint->assigned_staff_id = $staffId;

        // Auto-transition to ASSIGNED if currently CREATED
        if ($complaint->status === 'CREATED') {
            $complaint->status = 'ASSIGNED';
            $complaint->addStatusHistory('CREATED', 'ASSIGNED', $assignedBy, 'Auto-assigned to staff');
        }

        $complaint->save();

        // Notify the assigned staff
        $this->notifyStaffAssigned($complaint, $staffId);

        // Broadcast update
        try {
            event(new ComplaintStatusUpdated($complaint, 'CREATED', 'ASSIGNED'));
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast assignment: ' . $e->getMessage());
        }

        return $complaint;
    }

    /**
     * Create a notification for status change.
     */
    private function notifyStatusChange(Complaint $complaint, string $oldStatus, string $newStatus): void
    {
        try {
            Notification::create([
                'user_id' => $complaint->user_id,
                'organization_id' => $complaint->organization_id,
                'type' => 'status_updated',
                'title' => 'Complaint Status Updated',
                'message' => "Your complaint \"{$complaint->title}\" status changed from {$oldStatus} to {$newStatus}.",
                'data' => [
                    'complaint_id' => (string) $complaint->_id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create status notification: ' . $e->getMessage());
        }
    }

    /**
     * Notify staff about assignment.
     */
    private function notifyStaffAssigned(Complaint $complaint, string $staffId): void
    {
        try {
            Notification::create([
                'user_id' => $staffId,
                'organization_id' => $complaint->organization_id,
                'type' => 'complaint_assigned',
                'title' => 'New Complaint Assigned',
                'message' => "You have been assigned complaint: \"{$complaint->title}\".",
                'data' => [
                    'complaint_id' => (string) $complaint->_id,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create assignment notification: ' . $e->getMessage());
        }
    }
}
