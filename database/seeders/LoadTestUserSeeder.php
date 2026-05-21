<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Student;
use App\Models\Guardian;
use App\Models\Teacher;
use App\Models\TeacherAvailability;
use App\Models\Subject;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class LoadTestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $passwordRaw = 'StressTestPassword@123!';
        $passwordHash = Hash::make($passwordRaw);

        $studentsData = [];
        $teachersData = [];
        $guardiansData = [];

        // Fetch first two subjects for teacher assignment
        $subjectIds = Subject::limit(2)->pluck('id')->toArray();
        if (empty($subjectIds)) {
            // Fallback: create subjects if none exist
            $sub1 = Subject::create(['name' => 'Tajweed', 'slug' => 'tajweed', 'description' => 'Tajweed rules', 'is_active' => true, 'display_order' => 1]);
            $sub2 = Subject::create(['name' => 'Hifz', 'slug' => 'hifz', 'description' => 'Quran memorization', 'is_active' => true, 'display_order' => 2]);
            $subjectIds = [$sub1->id, $sub2->id];
        }

        // Get admin user for teacher approval field
        $admin = User::where('role', 'admin')->first();
        $adminId = $admin ? $admin->id : 1;

        $count = 50;
        $this->command->info("Seeding {$count} load test users of each role...");

        DB::transaction(function () use ($count, $passwordHash, $passwordRaw, $subjectIds, $adminId, &$studentsData, &$teachersData, &$guardiansData) {
            for ($i = 1; $i <= $count; $i++) {
                // 1. Create Student
                $studentEmail = "stress.student.{$i}@iqraquest.com";
                $studentUser = User::create([
                    'name' => "Stress Student {$i}",
                    'email' => $studentEmail,
                    'password' => $passwordHash,
                    'role' => UserRole::STUDENT,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);

                $studentProfile = $studentUser->student()->create([
                    'date_of_birth' => '2010-01-01',
                    'gender' => 'male',
                    'level' => 'beginner',
                    'learning_goals' => ['Learn Tajweed'],
                    'notes' => 'Stress test student',
                ]);

                $studentUser->wallet()->update([
                    'balance' => 100000.00,
                    'currency' => 'USD',
                ]);

                $studentsData[] = [
                    'id' => $studentUser->id,
                    'student_profile_id' => $studentProfile->id,
                    'email' => $studentEmail,
                    'password' => $passwordRaw,
                ];

                // 2. Create Guardian
                $guardianEmail = "stress.guardian.{$i}@iqraquest.com";
                $guardianUser = User::create([
                    'name' => "Stress Guardian {$i}",
                    'email' => $guardianEmail,
                    'password' => $passwordHash,
                    'role' => UserRole::GUARDIAN,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);

                $guardianProfile = $guardianUser->guardian()->create([
                    'phone' => '+1234567890',
                    'address' => '123 Stress St',
                    'city' => 'Lagos',
                    'country' => 'Nigeria',
                ]);

                $guardianUser->wallet()->update([
                    'balance' => 100000.00,
                    'currency' => 'USD',
                ]);

                // Link this guardian to the corresponding student
                $guardianProfile->students()->attach($studentProfile->id, [
                    'relationship' => 'parent',
                    'is_primary' => true,
                ]);

                $guardiansData[] = [
                    'id' => $guardianUser->id,
                    'email' => $guardianEmail,
                    'password' => $passwordRaw,
                ];

                // 3. Create Teacher
                $teacherEmail = "stress.teacher.{$i}@iqraquest.com";
                $teacherUser = User::create([
                    'name' => "Stress Teacher {$i}",
                    'email' => $teacherEmail,
                    'password' => $passwordHash,
                    'role' => UserRole::TEACHER,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);

                $teacherProfile = $teacherUser->teacher()->create([
                    'bio' => "Stress Test Teacher {$i}. Native speaker, certified tutor.",
                    'experience_years' => 5,
                    'hourly_rate' => 20.00,
                    'status' => 'approved',
                    'approved_by' => $adminId,
                    'approved_at' => now(),
                    'application_submitted_at' => now()->subDays(3),
                    'country' => 'Nigeria',
                    'city' => 'Lagos',
                    'preferred_language' => 'English',
                    'qualifications' => 'Ijazah in Quran recitation',
                    'teacher_type' => 'freelance',
                ]);

                // Attach subjects to the teacher
                foreach ($subjectIds as $subId) {
                    $teacherProfile->subjects()->attach($subId, [
                        'proficiency_level' => 'advanced',
                        'years_teaching' => 5,
                    ]);
                }

                // Add availability slots for Monday-Friday
                $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                foreach ($days as $day) {
                    TeacherAvailability::create([
                        'teacher_id' => $teacherProfile->id,
                        'day_of_week' => $day,
                        'is_available' => true,
                        'start_time' => '08:00:00',
                        'end_time' => '18:00:00',
                    ]);
                }

                $teachersData[] = [
                    'id' => $teacherUser->id,
                    'teacher_profile_id' => $teacherProfile->id,
                    'email' => $teacherEmail,
                    'password' => $passwordRaw,
                ];
            }
        });

        // Ensure target directory exists
        $outputDir = base_path('stress-test');
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // Write users to JSON
        $jsonData = json_encode([
            'students' => $studentsData,
            'teachers' => $teachersData,
            'guardians' => $guardiansData,
        ], JSON_PRETTY_PRINT);

        file_put_contents(base_path('stress-test/users.json'), $jsonData);
        $this->command->info('✅ Generated stress-test/users.json successfully!');
    }
}
