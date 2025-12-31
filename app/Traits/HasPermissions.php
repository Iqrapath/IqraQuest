<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasPermissions
{
    /**
     * Get the role assigned to the user.
     */
    public function roleDetail(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Check if the user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        // 1. Basic role check (Super Admin bypass)
        if ($this->isSuperAdmin()) {
            return true;
        }

        // 2. Fetch role and permissions
        $role = $this->roleDetail;
        if (!$role) {
            return false;
        }

        return $role->hasPermission($permission);
    }

    /**
     * Check if the user is a Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        // A user is a super admin if their identity is ADMIN and they have no role_id (Initial Admin)
        // OR if their assigned role is marked as is_system (e.g. Super Admin role)
        if (!$this->isAdmin()) {
            return false;
        }

        if (!$this->role_id) {
            return true;
        }

        return $this->roleDetail->slug === 'super-admin' || $this->roleDetail->is_system;
    }
}
