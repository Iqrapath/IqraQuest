<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@iqraquest.com',
            'password' => Hash::make('Admin@123456'),
            'role' => UserRole::ADMIN,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

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
        $teacherProfile = $teacher->teacher()->create([
            'bio' => 'Experienced Quran teacher with 10 years of experience. Specialized in Tajweed and memorization techniques.',
            'experience_years' => 10,
            'hourly_rate' => 18000,
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'application_submitted_at' => now()->subDays(2),
            'country' => 'Nigeria',
            'city' => 'Lagos',
            'preferred_language' => 'English',
            'qualifications' => 'Ijazah in Quran recitation',
        ]);

        // Create Guardian User
        $guardian = User::create([
            'name' => 'Guardian Demo',
            'email' => 'guardian@iqraquest.com',
            'password' => Hash::make('Guardian@123456'),
            'role' => UserRole::GUARDIAN,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create guardian profile
        $guardianProfile = $guardian->guardian()->create([
            'phone' => '+1234567890',
            'address' => '123 Main Street',
            'city' => 'New York',
            'country' => 'USA',
        ]);

        // Create Student User
        $student = User::create([
            'name' => 'Student Demo',
            'email' => 'student@iqraquest.com',
            'password' => Hash::make('Student@123456'),
            'role' => UserRole::STUDENT,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create student profile
        $studentProfile = $student->student()->create([
            'date_of_birth' => '2010-01-01',
            'gender' => 'male',
            'level' => 'beginner',
            'learning_goals' => ['Learn Tajweed', 'Memorize Juz Amma'],
            'notes' => 'Eager to learn',
        ]);

        // Link guardian to student
        $guardianProfile->students()->attach($studentProfile->id, [
            'relationship' => 'parent',
            'is_primary' => true,
        ]);

        $this->command->info('✅ Demo users created successfully!');
        $this->command->newLine();
        $this->command->info('Login Credentials:');
        $this->command->info('Admin: admin@iqraquest.com / Admin@123456');
        $this->command->info('Teacher: teacher@iqraquest.com / Teacher@123456');
        $this->command->info('Guardian: guardian@iqraquest.com / Guardian@123456');
        $this->command->info('Student: student@iqraquest.com / Student@123456');
    }
}
