<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Complaint;

// Broadcast::routes() configures auth. 
// For JWT, we must explicitly tell it to use the api auth guard.
Broadcast::routes(['middleware' => ['api', 'auth:api']]);

Broadcast::channel('user.{id}', function ($user, $id) {
    return (string) $user->_id === (string) $id;
});

Broadcast::channel('organization.{id}', function ($user, $id) {
    // Only super admins or members of the organization can listen
    if ($user->isSuperAdmin()) {
        return true;
    }
    return (string) $user->organization_id === (string) $id;
});

Broadcast::channel('complaint.{id}.chat', function ($user, $id) {
    $complaint = Complaint::find($id);
    if (!$complaint) return false;

    // Super Admin can access everything
    if ($user->isSuperAdmin()) return true;

    // The person who created the complaint
    if ((string) $user->_id === (string) $complaint->user_id) return true;

    // The assigned staff member
    if ((string) $user->_id === (string) $complaint->assigned_staff_id) return true;

    // Org Admins / Staff of the same organization
    if ($user->organization_id === $complaint->organization_id && 
        in_array($user->role, ['org_admin', 'staff'])) {
        return true;
    }

    return false;
});
