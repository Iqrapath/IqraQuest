<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update Admin User
        User::updateOrCreate(
            ['email' => 'Officialiqraquest@gmail.com'],
            [
                'name' => 'Official IqraQuest Admin',
                'password' => Hash::make('Iqraquest2025'),
                'role' => UserRole::ADMIN,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Admin User created successfully!');
    }
}
