<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User as AdminUser; // Use alias if needed or finding admin

class TeacherDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find Admin for approval
        $admin = User::where('email', 'admin@iqraquest.com')->first();
        $adminId = $admin ? $admin->id : 1; // Fallback

        // Create Teacher User
        $teacher = User::create([
            'name' => 'Teacher Demo',
            'email' => 'teacher@iqraquest.com',
            'password' => Hash::make('Teacher@123456'),
            'role' => UserRole::TEACHER,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create teacher profile
        $teacher->teacher()->create([
            'bio' => 'Experienced Quran teacher with 10 years of experience. Specialized in Tajweed and memorization techniques.',
            'experience_years' => 10,
            'hourly_rate' => 18000,
            'status' => 'approved',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'application_submitted_at' => now()->subDays(2),
            'country' => 'Nigeria',
            'city' => 'Lagos',
            'preferred_language' => 'English',
            'qualifications' => 'Ijazah in Quran recitation',
        ]);

        $this->command->info('✅ Teacher Demo user created successfully!');
    }
}
