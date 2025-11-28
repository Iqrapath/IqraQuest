<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case TEACHER = 'teacher';
    case GUARDIAN = 'guardian';
    case STUDENT = 'student';

    /**
     * Get all role values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get role label
     */
    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrator',
            self::TEACHER => 'Teacher',
            self::GUARDIAN => 'Guardian',
            self::STUDENT => 'Student',
        };
    }

    /**
     * Get dashboard route for role
     */
    public function dashboardRoute(): string
    {
        return match($this) {
            self::ADMIN => 'admin.dashboard',
            self::TEACHER => 'teacher.dashboard',
            self::GUARDIAN => 'guardian.dashboard',
            self::STUDENT => 'student.dashboard',
        };
    }
}
