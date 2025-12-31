<?php

namespace App\Constants;

class Permissions
{
    // Teacher Management
    public const TEACHERS_VIEW = 'teachers.view';
    public const TEACHERS_EDIT = 'teachers.edit';
    public const TEACHERS_VERIFY = 'teachers.verify';
    public const TEACHERS_DELETE = 'teachers.delete';

    // Student Management
    public const STUDENTS_VIEW = 'students.view';
    public const STUDENTS_EDIT = 'students.edit';
    public const STUDENTS_DELETE = 'students.delete';

    // Financial
    public const PAYMENTS_VIEW = 'payments.view';
    public const PAYMENTS_MANAGE = 'payments.manage';
    public const PAYOUTS_APPROVE = 'payouts.approve';

    // Content Management
    public const CMS_MANAGE = 'cms.manage';
    public const FAQ_MANAGE = 'faq.manage';

    // System Settings
    public const SETTINGS_VIEW = 'settings.view';
    public const SETTINGS_EDIT = 'settings.edit';
    public const ROLES_MANAGE = 'roles.manage';

    /**
     * Get all permissions grouped by category for the UI.
     */
    public static function getAllGrouped(): array
    {
        return [
            'Teacher Management' => [
                self::TEACHERS_VIEW => 'View Teachers',
                self::TEACHERS_EDIT => 'Edit Teachers',
                self::TEACHERS_VERIFY => 'Verify Applications',
                self::TEACHERS_DELETE => 'Delete Teachers',
            ],
            'Student Management' => [
                self::STUDENTS_VIEW => 'View Students',
                self::STUDENTS_EDIT => 'Edit Students',
                self::STUDENTS_DELETE => 'Delete Students',
            ],
            'Financial Controls' => [
                self::PAYMENTS_VIEW => 'View Payments',
                self::PAYMENTS_MANAGE => 'Manage Commission & Thresholds',
                self::PAYOUTS_APPROVE => 'Approve/Reject Payouts',
            ],
            'Content & Settings' => [
                self::CMS_MANAGE => 'Manage CMS Content',
                self::FAQ_MANAGE => 'Manage Knowledge Base',
                self::SETTINGS_VIEW => 'View System Settings',
                self::SETTINGS_EDIT => 'Edit System Settings',
                self::ROLES_MANAGE => 'Manage Admins & Roles',
            ],
        ];
    }
}
