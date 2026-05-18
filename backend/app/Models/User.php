<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;
use MongoDB\Laravel\Auth\User as MongoAuthenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

/**
 * User Model
 *
 * Represents a user in the CaseBridge system.
 * Supports roles: user, staff, org_admin, super_admin
 * Uses MongoDB as the database driver.
 */
class User extends MongoAuthenticatable implements JWTSubject
{
    use Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'organization_id',
        'avatar',
        'phone',
        'is_active',
        'google_id',
        'otp',
        'otp_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Default attribute values
     */
    protected $attributes = [
        'role' => 'user',
        'is_active' => true,
    ];

    // ─── JWT Methods ─────────────────────────────────────────────

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role,
            'organization_id' => $this->organization_id,
        ];
    }

    // ─── Relationships ───────────────────────────────────────────

    /**
     * Get the organization this user belongs to.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get complaints submitted by this user.
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Get complaints assigned to this user (staff).
     */
    public function assignedComplaints()
    {
        return $this->hasMany(Complaint::class, 'assigned_staff_id');
    }

    /**
     * Get notifications for this user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────

    /**
     * Scope: filter by organization
     */
    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope: filter active users only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: filter by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is an organization admin.
     */
    public function isOrgAdmin(): bool
    {
        return $this->role === 'org_admin';
    }

    /**
     * Check if user is staff.
     */
    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }
}
