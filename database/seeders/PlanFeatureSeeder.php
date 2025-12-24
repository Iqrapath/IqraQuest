<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanFeatureSeeder extends Seeder
{
    /**
     * Available plan features that can be assigned to subscription plans.
     * These are stored as JSON in the subscription_plans.features column.
     */
    public static array $features = [
        [
            'slug' => 'daily_sessions',
            'name' => 'Daily Quran Sessions',
            'description' => 'Access to daily one-on-one Quran learning sessions with qualified teachers',
            'icon' => 'solar:book-bold',
        ],
        [
            'slug' => 'weekly_assessments',
            'name' => 'Weekly Assessments',
            'description' => 'Regular weekly assessments to track learning progress and identify areas for improvement',
            'icon' => 'solar:clipboard-check-bold',
        ],
        [
            'slug' => 'progress_dashboard',
            'name' => 'Progress Tracking Dashboard',
            'description' => 'Full access to detailed progress tracking with attendance, memorization stats, and analytics',
            'icon' => 'solar:chart-bold',
        ],
        [
            'slug' => 'certificate',
            'name' => 'Final Certificate on Completion',
            'description' => 'Receive a professional certificate upon completing your learning goals',
            'icon' => 'solar:diploma-bold',
        ],
        [
            'slug' => 'personalized_plan',
            'name' => 'Personalized Learning Plan',
            'description' => 'Custom learning path tailored to your goals, pace, and learning style',
            'icon' => 'solar:user-check-bold',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a reference table for plan features (optional, for admin UI)
        // The features are primarily stored as JSON in subscription_plans.features
        
        // If you want a separate plan_features table, uncomment below:
        // foreach (self::$features as $feature) {
        //     DB::table('plan_features')->updateOrInsert(
        //         ['slug' => $feature['slug']],
        //         $feature
        //     );
        // }

        $this->command->info('Plan features available:');
        foreach (self::$features as $feature) {
            $this->command->line("  - {$feature['slug']}: {$feature['name']}");
        }
    }

    /**
     * Get all available feature slugs.
     */
    public static function getFeatureSlugs(): array
    {
        return array_column(self::$features, 'slug');
    }

    /**
     * Get feature by slug.
     */
    public static function getFeature(string $slug): ?array
    {
        foreach (self::$features as $feature) {
            if ($feature['slug'] === $slug) {
                return $feature;
            }
        }
        return null;
    }
}
