<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed demo users with roles
        $this->call([
            AdminSettingSeeder::class,
            PlanFeatureSeeder::class,
            AdminSeeder::class,
            SubjectSeeder::class,
            // GuardianSeeder::class,
            // StudentSeeder::class,
            // TeacherDemoSeeder::class,
            // TeacherSeeder::class, // Bulk seeder if needed
            // PayoutSeeder::class,
        ]);
    }
}
