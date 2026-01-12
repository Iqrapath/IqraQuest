<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GuardianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
        $guardian->guardian()->create([
            'phone' => '+1234567890',
            'address' => '123 Main Street',
            'city' => 'New York',
            'country' => 'USA',
        ]);

        $this->command->info('✅ Guardian Demo user created successfully!');
    }
}
