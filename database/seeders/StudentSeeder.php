<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Guardian; // Assuming Guardian model exists and is linked via user

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
        // Find Guardian by email
        $guardianUser = User::where('email', 'guardian@iqraquest.com')->first();
        
        if ($guardianUser && $guardianUser->guardian) {
            $guardianUser->guardian->students()->attach($studentProfile->id, [
                'relationship' => 'parent',
                'is_primary' => true,
            ]);
            $this->command->info('✅ Student Demo created and linked to Guardian!');
        } else {
            $this->command->warn('⚠️ Guardian not found. Student created but not linked.');
        }
    }
}
