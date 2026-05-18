<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Organization Model
 *
 * Represents an organization (college, hospital, office, society)
 * that uses CaseBridge for complaint management.
 */
class Organization extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'organizations';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'description',
        'logo',
        'address',
        'contact_email',
        'contact_phone',
        'is_active',
        'settings',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected $attributes = [
        'is_active' => true,
    ];

    // ─── Relationships ───────────────────────────────────────────

    /**
     * Get all users belonging to this organization.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all staff members of this organization.
     */
    public function staff()
    {
        return $this->hasMany(User::class)->where('role', 'staff');
    }

    /**
     * Get all organization admins.
     */
    public function admins()
    {
        return $this->hasMany(User::class)->where('role', 'org_admin');
    }

    /**
     * Get all complaints for this organization.
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Get the user who created this organization (super admin).
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ─── Scopes ──────────────────────────────────────────────────

    /**
     * Scope: active organizations only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: filter by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * Get the categories configured for this organization.
     */
    public function getCategories(): array
    {
        return $this->settings['categories'] ?? [];
    }

    /**
     * Check if auto-assignment is enabled.
     */
    public function hasAutoAssign(): bool
    {
        return $this->settings['auto_assign'] ?? false;
    }
}
