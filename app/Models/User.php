<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    /**
     * Check if user is teacher
     */
    public function isTeacher(): bool
    {
        return $this->role === UserRole::TEACHER;
    }

    /**
     * Check if user is guardian
     */
    public function isGuardian(): bool
    {
        return $this->role === UserRole::GUARDIAN;
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->role === UserRole::STUDENT;
    }

    /**
     * Get the teacher profile
     */
    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    /**
     * Get the guardian profile
     */
    public function guardian(): HasOne
    {
        return $this->hasOne(Guardian::class);
    }

    /**
     * Get the student profile
     */
    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    /**
     * Get dashboard route based on role
     */
    public function dashboardRoute(): string
    {
        return $this->role->dashboardRoute();
    }
}
