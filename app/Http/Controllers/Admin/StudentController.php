<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use App\Services\BookingStatusService;

class StudentController extends Controller
{
    protected $bookingStatusService;

    public function __construct(BookingStatusService $bookingStatusService)
    {
        $this->bookingStatusService = $bookingStatusService;
    }

    /**
     * Display a listing of students and guardians.
     */
    public function index(Request $request): Response
    {
        $query = User::whereIn('role', [UserRole::STUDENT, UserRole::GUARDIAN])
            ->with(['student.subjects', 'guardian.students.user']);

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Subject Filter
        if ($request->filled('subject') && $request->subject !== 'all') {
            $subject = $request->subject;
            $query->where(function ($q) use ($subject) {
                 $q->whereHas('student.subjects', function ($sq) use ($subject) {
                     $sq->where('name', $subject);
                 })->orWhereHas('guardian.subjects', function ($gq) use ($subject) {
                     $gq->where('name', $subject);
                 });
            });
        }

        $users = $query->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function ($user) {
                // Determine profile (Student or Guardian)
                $profile = $user->student ?? $user->guardian;
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone, // Ensure phone is available on User or Profile? User has phone.
                    'joined_at' => $user->created_at->format('M d, Y'),
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar_url,
                    'role' => $user->role->value,
                    'status' => $user->status,
                    'student_id' => $user->student?->id ?? $user->guardian?->id,
                    // Pass profile data needed for modals
                    'profile' => $profile ? [
                        'id' => $profile->id,
                        'city' => $profile->city,
                        'country' => $profile->country,
                        'subjects' => $profile->subjects->pluck('name')->toArray(), // For prefs
                        'teaching_mode' => $profile->availability_type,
                        'age_group' => $profile->level, // or age_group if different
                        'additional_notes' => $user->student ? $profile->notes : $profile->learning_goal_description,
                        'preferred_hours' => $profile->preferred_hours,
                    ] : null,
                ];
            });

        $subjects = \App\Models\Subject::pluck('name')->toArray();

        return Inertia::render('Admin/Students/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'role', 'subject']),
            'subjects' => $subjects,
        ]);
    }

    /**
     * Display the specified student/guardian profile.
     */
    public function show($id): Response
    {
        // $id could be a student id or a guardian id depending on how we route, 
        // but here it's likely the user id for simplicity or we fetch the user by their profile id.
        $user = User::whereIn('role', [UserRole::STUDENT, UserRole::GUARDIAN])
            ->with([
                'student.subjects',
                'student.guardians.user',
                'guardian.students.user',
                'guardian.subjects'
            ])
            ->findOrFail($id);

        $profile = $user->student ?: $user->guardian;
        
        // Fetch Booking Stats
        $stats = $this->bookingStatusService->getStatusCounts($user);
        
        // Fetch Recent Bookings
        $bookings = $user->bookings()
            ->with(['teacher.user', 'subject'])
            ->latest('start_time')
            ->limit(5)
            ->get()
            ->map(fn($booking) => $this->bookingStatusService->formatBookingForResponse($booking, $user));

        // Get relationship data with age calculation
        $related_users = [];
        if ($user->isGuardian()) {
            $related_users = $user->guardian->students->map(fn($s) => [
                'name' => $s->user->name,
                'avatar' => $s->user->avatar_url,
                'age' => $s->date_of_birth ? now()->diffInYears($s->date_of_birth) : null,
            ]);
        } elseif ($user->isStudent()) {
            $related_users = $user->student->guardians->map(fn($g) => [
                'name' => $g->user->name,
                'avatar' => $g->user->avatar_url,
            ]);
        }

        // Calculate upcoming sessions
        $upcomingSessions = $user->bookings()
            ->where('start_time', '>', now())
            ->where('status', 'confirmed')
            ->count();

        return Inertia::render('Admin/Students/Show', [
            'student' => [
                'id' => $user->id,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar_url,
                    'role' => $user->role->value,
                ],
                'city' => $profile->city ?? 'N/A',
                'country' => $profile->country ?? 'N/A',
                'status' => $user->status,
                'joined_at' => $user->created_at->format('M d, Y'),
                'sessions_count' => $stats['completed'] ?? 0,
                'subjects' => $profile->subjects->pluck('name')->implode(', '),
                'preferred_times' => $profile->preferred_hours ?? 'Not set',
                'age_group' => $user->isStudent() ? ($profile->level ?? 'N/A') : 'N/A',
                'related_users' => $related_users,
                'teaching_mode' => $profile->availability_type,
                'additional_notes' => $user->isStudent() ? $profile->notes : $profile->learning_goal_description,
            ],
            'bookings' => $bookings,
            'stats' => [
                'attendance_rate' => array_sum($stats) > 0 ? round(($stats['completed'] / array_sum($stats)) * 100) : 0,
                'missed_sessions' => $stats['cancelled'] ?? 0,
                'upcoming_sessions' => $upcomingSessions,
            ],
            'all_subjects' => \App\Models\Subject::pluck('name')->toArray(),
        ]);
    }



    public function progress(User $user)
    {
        $student = $user->student ?? $user->guardian;
        
        // Fetch bookings for the student/user
        $bookings = \App\Models\Booking::where('user_id', $user->id)
            ->with(['teacher.user', 'subject'])
            ->orderBy('start_time', 'desc')
            ->get();

        // Calculate Stats
        $totalSessions = $bookings->where('status', 'completed')->count();
        $missedSessions = $bookings->where('status', 'missed')->count(); 
        
        // Calculate engagement
        $pastBookingsCount = $bookings->filter(function ($booking) {
            return $booking->start_time->isPast();
        })->count();

        $engagement = $pastBookingsCount > 0 
            ? round(($totalSessions / $pastBookingsCount) * 100) 
            : 0;

        $stats = [
            'sessions_attended' => $totalSessions,
            'missed_classes' => $missedSessions,
            'average_engagement' => $engagement . '%'
        ];
        
        // No active subscription system yet
        $plan = null;
        
        // Ensure student profile has user relation loaded
        if ($student) {
            $student->setRelation('user', $user);
        }

        return Inertia::render('Admin/Students/Progress', [
            'student' => $student,
            'user' => $user,
            'bookings' => $bookings,
            'stats' => $stats,
            'plan' => $plan
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|string|in:active,pending,suspended,rejected',
            'role' => 'required|string|in:student,guardian',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated) {
            $password = \Illuminate\Support\Str::random(10); // Generate random password

            // Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'status' => $validated['status'],
                'role' => $validated['role'],
                'password' => bcrypt($password),
                'email_verified_at' => now(), // Auto-verify email
            ]);

            // Create Profile
            if ($validated['role'] === 'student') {
                $user->student()->create([
                    'city' => $validated['city'] ?? null,
                    'country' => $validated['country'] ?? null,
                ]);
            } else {
                $user->guardian()->create([
                    'city' => $validated['city'] ?? null,
                    'country' => $validated['country'] ?? null,
                ]);
            }

            // Send Welcome Email with credentials
            try {
                $user->notify(new \App\Notifications\StudentAccountCreatedNotification($password));
            } catch (\Exception $e) {
                // Log error but proceed
                \Illuminate\Support\Facades\Log::error('Failed to send welcome email: ' . $e->getMessage());
            }

            // Return the created user structure needed for the frontend
            $profile = $user->student ?? $user->guardian;
            
            // Return JSON for the modal to handle next step
            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role->value,
                    'status' => $user->status,
                    'joined_at' => $user->created_at->format('M d, Y'),
                    'student_id' => $user->student?->id ?? $user->guardian?->id,
                    'profile' => [
                        'id' => $profile->id,
                        'city' => $profile->city,
                        'country' => $profile->country,
                         'subjects' => [],
                    ]
                ]
            ]);
        });
    }

    public function updateContact(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'status' => 'required|string|in:active,pending,suspended,rejected',
            'city' => 'nullable|string|max:255',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        // Update profile city
        $profile = $user->student ?? $user->guardian;
        if ($profile) {
            $profile->update(['city' => $validated['city'] ?? $profile->city]);
        }

        return back()->with('success', 'Contact information updated successfully.');
    }

    public function updateLearningPreferences(Request $request, User $user)
    {
        $validated = $request->validate([
            'subjects' => 'nullable|array',
            'subjects.*' => 'string',
            'teaching_mode' => 'nullable|string',
            'age_group' => 'nullable|string',
            'preferred_times' => 'nullable|array',
            'additional_notes' => 'nullable|string',
        ]);

        $profile = $user->student ?? $user->guardian;
        
        if ($profile) {
            $updateData = [
                'availability_type' => $validated['teaching_mode'] ?? $profile->availability_type,
            ];

            // Handle Age Group / Level
            if (isset($validated['age_group'])) {
                // If it's a student, map to level. If guardian, maybe ignore or map if compatible.
                // Student model has level. Guardian doesn't seem to have level in fillable (check Guardian.php).
                // Actually Guardian.php doesn't have level.
                if ($user->student) {
                    $updateData['level'] = $validated['age_group'];
                }
            }

            // Handle Preferred Times
            if (isset($validated['preferred_times'])) {
                 $updateData['preferred_hours'] = json_encode($validated['preferred_times']);
            }

            // Handle Notes
            if (isset($validated['additional_notes'])) {
                if ($user->student) {
                    $updateData['notes'] = $validated['additional_notes'];
                } else {
                    $updateData['learning_goal_description'] = $validated['additional_notes'];
                }
            }

            $profile->update($updateData);

            // Sync Subjects
            if (isset($validated['subjects'])) {
                 $subjectIds = [];
                 foreach ($validated['subjects'] as $subjectName) {
                     $subject = \App\Models\Subject::firstOrCreate(['name' => $subjectName]);
                     $subjectIds[] = $subject->id;
                 }
                 $profile->subjects()->sync($subjectIds);
            }
        }

        return back()->with('success', 'Learning preferences updated successfully.');
    }

    /**
     * Update user status.
     */
    public function updateStatus(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|in:active,suspended,rejected',
            'reason' => 'nullable|string|max:1000',
        ]);

        $user->update(['status' => $request->status]);

        // Logic for notifications could go here

        return back()->with('success', "User status updated to {$request->status}.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        // Ensure we're not deleting an admin
        if ($user->isAdmin()) {
            return back()->with('error', 'Administrators cannot be deleted.');
        }

        DB::transaction(function () use ($user) {
            // Delete related profiles
            $user->student()?->delete();
            $user->guardian()?->delete();
            $user->delete();
        });

        return redirect()->route('admin.students.index')->with('success', 'User account deleted successfully.');
    }
}
