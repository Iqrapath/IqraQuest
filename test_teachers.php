<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check teachers count
$teacherCount = \App\Models\Teacher::count();
echo "Total teachers in database: $teacherCount\n";

// Check teachers with users
$teachersWithUsers = \App\Models\Teacher::whereHas('user')->count();
echo "Teachers with user accounts: $teachersWithUsers\n";

// Get first 3 teachers
echo "\nFirst 3 teachers:\n";
\App\Models\Teacher::with('user')->limit(3)->get()->each(function($teacher) {
    echo "- ID: {$teacher->id}, User: {$teacher->user->name}, Rate: ₦{$teacher->hourly_rate}\n";
});

// Simulate API request
echo "\n\nTesting API endpoint...\n";
$teachers = \App\Models\Teacher::query()
    ->with(['user', 'subjects.subject'])
    ->select('teachers.*')
    ->selectSub(function ($query) {
        $query->from('reviews')
            ->selectRaw('AVG(rating)')
            ->whereColumn('teacher_id', 'teachers.id')
            ->where('is_approved', true);
    }, 'average_rating')
    ->selectSub(function ($query) {
        $query->from('reviews')
            ->selectRaw('COUNT(*)')
            ->whereColumn('teacher_id', 'teachers.id')
            ->where('is_approved', true);
    }, 'total_reviews')
    ->paginate(12);

echo "API would return {$teachers->count()} teachers (page 1 of {$teachers->lastPage()})\n";
echo "Total: {$teachers->total()} teachers\n";

if ($teachers->count() > 0) {
    echo "\nSample teacher data:\n";
    $first = $teachers->first();
    echo "Name: {$first->user->name}\n";
    echo "Bio: " . substr($first->bio, 0, 100) . "...\n";
    echo "Subjects: " . $first->subjects->pluck('subject.name')->implode(', ') . "\n";
    echo "Rating: " . (round((float) $first->average_rating, 1) ?: 0) . "\n";
}
