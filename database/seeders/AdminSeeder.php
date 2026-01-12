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
        // Create Admin User
        User::create([
            'name' => 'Official IqraQuest Admin',
            'email' => 'Officialiqraquest@gmail.com',
            'password' => Hash::make('Iqraquest2025'),
            'role' => UserRole::ADMIN,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Admin User created successfully!');
    }
}
