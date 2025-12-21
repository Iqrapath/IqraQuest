<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminBroadcast;
use App\Models\Booking;
use App\Models\Teacher;
use App\Models\User;
use App\Notifications\AdminBroadcastNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'history');
        
        //urgent action items
        $urgentItems = $this->getUrgentItems();
        
        // Get notification history (admin broadcasts)
        $historyQuery = AdminBroadcast::with('creator')
            ->where('status', 'sent')
            ->latest('sent_at');
        
        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $historyQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('type')) {
            $historyQuery->where('type', $request->type);
        }
        
        if ($request->filled('audience')) {
            $historyQuery->where('target_audience', $request->audience);
        }
        
        $history = $historyQuery->paginate(15)->through(function ($broadcast) {
            return [
                'id' => $broadcast->id,
                'title' => $broadcast->title,
                'message' => $broadcast->message,
                'type' => $broadcast->type,
                'target_audience' => $broadcast->target_audience,
                'total_recipients' => $broadcast->total_recipients,
                'delivered_count' => $broadcast->delivered_count,
                'read_count' => $broadcast->read_count,
                'sent_at' => $broadcast->sent_at?->format('M d, Y - h:i A'),
                'sent_at_human' => $broadcast->sent_at?->diffForHumans(),
                'created_by' => $broadcast->creator?->name,
            ];
        });
        
        // Get scheduled notifications
        $scheduled = AdminBroadcast::with('creator')
            ->whereIn('status', ['draft', 'scheduled'])
            ->orderBy('scheduled_at')
            ->get()
            ->map(function ($broadcast) {
                return [
                    'id' => $broadcast->id,
                    'title' => $broadcast->title,
                    'message' => $broadcast->message,
                    'type' => $broadcast->type,
                    'target_audience' => $broadcast->target_audience,
                    'frequency' => $broadcast->frequency,
                    'scheduled_at' => $broadcast->scheduled_at?->format('M d, Y - h:i A'),
                    'status' => $broadcast->status,
                    'created_by' => $broadcast->creator?->name,
                ];
            });
        
        // Get completed classes (completed bookings)
        $completedClassesQuery = Booking::with(['teacher.user', 'student', 'subject'])
            ->where(function ($q) {
                $q->where('status', 'completed')
                    ->orWhere(function ($q2) {
                        $q2->where('status', 'confirmed')
                            ->where('end_time', '<', now());
                    });
            })
            ->orderBy('end_time', 'desc');
        
        // Apply search filter for completed classes
        if ($request->filled('search') && $tab === 'completed') {
            $search = $request->search;
            $completedClassesQuery->where(function ($q) use ($search) {
                $q->whereHas('student', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('teacher.user', function ($tq) use ($search) {
                    $tq->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('subject', function ($subq) use ($search) {
                    $subq->where('name', 'like', "%{$search}%");
                });
            });
        }
        
        $completedClasses = $completedClassesQuery->paginate(15)->through(function ($booking) {
            return [
                'id' => $booking->id,
                'student' => [
                    'id' => $booking->student->id,
                    'name' => $booking->student->name,
                    'email' => $booking->student->email,
                    'avatar' => $booking->student->avatar,
                ],
                'teacher' => [
                    'id' => $booking->teacher->id,
                    'name' => $booking->teacher->user->name,
                    'avatar' => $booking->teacher->user->avatar,
                ],
                'subject' => [
                    'id' => $booking->subject->id,
                    'name' => $booking->subject->name,
                ],
                'start_time' => $booking->start_time->format('M d, Y - h:i A'),
                'end_time' => $booking->end_time->format('M d, Y - h:i A'),
                'duration_minutes' => $booking->start_time->diffInMinutes($booking->end_time),
                'total_price' => (float) $booking->total_price,
                'currency' => $booking->currency,
                'payment_status' => $booking->payment_status,
                'completed_at' => $booking->end_time->format('M d, Y - h:i A'),
                'completed_at_human' => $booking->end_time->diffForHumans(),
            ];
        });
        
        return Inertia::render('Admin/Notifications/Index', [
            'urgentItems' => $urgentItems,
            'history' => $history,
            'scheduled' => $scheduled,
            'completedClasses' => $completedClasses,
            'tab' => $tab,
            'filters' => $request->only(['search', 'type', 'audience']),
        ]);
    }

    public function show(AdminBroadcast $broadcast)
    {
        $broadcast->load('creator');
        
        // Get delivery analytics from notifications table
        $notificationStats = DB::table('notifications')
            ->where('type', 'App\\Notifications\\AdminBroadcastNotification')
            ->whereJsonContains('data->broadcast_id', $broadcast->id)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as read_count
            ')
            ->first();
        
        // Get recipients with their delivery status
        $recipients = DB::table('notifications')
            ->join('users', 'notifications.notifiable_id', '=', 'users.id')
            ->where('notifications.type', 'App\\Notifications\\AdminBroadcastNotification')
            ->whereJsonContains('notifications.data->broadcast_id', $broadcast->id)
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.role',
                'notifications.read_at',
                'notifications.created_at as delivered_at',
            ])
            ->orderBy('notifications.created_at', 'desc')
            ->paginate(20);
        
        return Inertia::render('Admin/Notifications/Show', [
            'broadcast' => [
                'id' => $broadcast->id,
                'title' => $broadcast->title,
                'message' => $broadcast->message,
                'type' => $broadcast->type,
                'target_audience' => $broadcast->target_audience,
                'total_recipients' => $broadcast->total_recipients,
                'delivered_count' => $notificationStats->total ?? 0,
                'read_count' => $notificationStats->read_count ?? 0,
                'sent_at' => $broadcast->sent_at?->format('M d, Y - h:i A'),
                'created_by' => $broadcast->creator?->name,
                'status' => $broadcast->status,
            ],
            'recipients' => $recipients,
        ]);
    }

    public function create(Request $request)
    {
        // Get user counts for audience selection
        $audienceCounts = [
            'all' => User::whereIn('role', ['student', 'teacher', 'guardian'])->count(),
            'students' => User::where('role', 'student')->count(),
            'teachers' => User::where('role', 'teacher')->count(),
            'guardians' => User::where('role', 'guardian')->count(),
        ];
        
        // Check if duplicating an existing broadcast
        $duplicateData = null;
        if ($request->filled('duplicate')) {
            $broadcast = AdminBroadcast::find($request->duplicate);
            if ($broadcast) {
                $duplicateData = [
                    'title' => $broadcast->title,
                    'message' => $broadcast->message,
                    'type' => $broadcast->type,
                    'target_audience' => $broadcast->target_audience,
                    'target_user_ids' => $broadcast->target_user_ids ?? [],
                    'frequency' => $broadcast->frequency,
                ];
            }
        }
        
        return Inertia::render('Admin/Notifications/Create', [
            'audienceCounts' => $audienceCounts,
            'duplicateData' => $duplicateData,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|in:system,announcement,custom',
            'target_audience' => 'required|in:all,students,teachers,guardians,specific',
            'target_user_ids' => 'nullable|array',
            'target_user_ids.*' => 'exists:users,id',
            'frequency' => 'required|in:one_time,daily,weekly',
            'scheduled_at' => 'nullable|date',
            'send_now' => 'boolean',
            'send_channels' => 'nullable|array',
            'send_channels.in_app' => 'boolean',
            'send_channels.email' => 'boolean',
        ]);
        
        // Additional validation for scheduled_at
        if (!empty($validated['scheduled_at'])) {
            $scheduledAt = \Carbon\Carbon::parse($validated['scheduled_at']);
            if ($scheduledAt->isPast()) {
                return back()->withErrors(['scheduled_at' => 'The scheduled time must be in the future.'])->withInput();
            }
        }
        
        // Handle all_users_toggle - if true, set target_audience to 'all'
        if ($request->boolean('all_users_toggle')) {
            $validated['target_audience'] = 'all';
        }
        
        // Determine if email should be sent
        $sendEmail = $request->input('send_channels.email', false) || $request->input('send_channels.all', false);
        
        $broadcast = AdminBroadcast::create([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type'],
            'target_audience' => $validated['target_audience'],
            'target_user_ids' => $validated['target_user_ids'] ?? null,
            'frequency' => $validated['frequency'],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'status' => $request->boolean('send_now') ? 'sent' : ($validated['scheduled_at'] ? 'scheduled' : 'draft'),
            'created_by' => auth()->id(),
        ]);
        
        // Send immediately if requested
        if ($request->boolean('send_now')) {
            $this->sendBroadcast($broadcast, $sendEmail);
        }
        
        return redirect()->route('admin.notifications.index')
            ->with('success', $request->boolean('send_now') 
                ? 'Notification sent successfully!' 
                : 'Notification scheduled successfully!');
    }

    public function send(AdminBroadcast $broadcast)
    {
        if ($broadcast->status === 'sent') {
            return back()->with('error', 'This notification has already been sent.');
        }
        
        $this->sendBroadcast($broadcast);
        
        return back()->with('success', 'Notification sent successfully!');
    }

    public function resend(AdminBroadcast $broadcast)
    {
        // Create a copy and send
        $newBroadcast = $broadcast->replicate();
        $newBroadcast->status = 'sent';
        $newBroadcast->sent_at = now();
        $newBroadcast->save();
        
        $this->sendBroadcast($newBroadcast, false);
        
        return back()->with('success', 'Notification resent successfully!');
    }

    public function destroy(AdminBroadcast $broadcast)
    {
        if ($broadcast->status === 'sent') {
            return back()->with('error', 'Cannot delete a sent notification.');
        }
        
        $broadcast->delete();
        
        return back()->with('success', 'Notification deleted successfully!');
    }

    public function cancel(AdminBroadcast $broadcast)
    {
        if ($broadcast->status === 'sent') {
            return back()->with('error', 'Cannot cancel a sent notification.');
        }
        
        $broadcast->update(['status' => 'cancelled']);
        
        return back()->with('success', 'Notification cancelled successfully!');
    }

    /**
     * Send the broadcast to target users
     */
    private function sendBroadcast(AdminBroadcast $broadcast, bool $sendEmail = false): void
    {
        $users = $broadcast->getTargetUsers();
        
        $broadcast->update([
            'total_recipients' => $users->count(),
            'sent_at' => now(),
            'status' => 'sent',
        ]);
        
        // Send notification to all target users
        Notification::send($users, new AdminBroadcastNotification($broadcast, $sendEmail));
        
        // Update delivered count (all sent = delivered for now)
        $broadcast->update(['delivered_count' => $users->count()]);
    }

    /**
     * Get urgent action items for admin
     */
    private function getUrgentItems(): array
    {
        return [
            [
                'label' => 'Withdrawal Requests Pending Approval',
                'count' => DB::table('payouts')->where('status', 'pending')->count(),
                'action' => 'View Requests',
                'route' => '/admin/payouts',
            ],
            [
                'label' => 'Teacher Applications Awaiting Verification',
                'count' => Teacher::where('status', 'pending')->count(),
                'action' => 'Review Now',
                'route' => '/admin/teachers/pending',
            ],
            [
                'label' => 'Sessions Pending Teacher Assignment',
                'count' => Booking::where('status', 'pending')->whereNull('teacher_id')->count(),
                'action' => 'Assign Teachers',
                'route' => '/admin/bookings?status=pending',
            ],
            [
                'label' => 'Reported Disputes Requiring Resolution',
                'count' => Booking::whereNotNull('dispute_raised_at')->whereNull('dispute_resolved_at')->count(),
                'action' => 'Open Disputes',
                'route' => '/admin/disputes',
            ],
        ];
    }

    /**
     * Search users for specific targeting
     */
    public function searchUsers(Request $request)
    {
        $search = $request->get('search', '');
        $role = $request->get('role');
        
        $query = User::whereIn('role', ['student', 'teacher', 'guardian'])
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        
        if ($role) {
            $query->where('role', $role);
        }
        
        return $query->limit(20)->get(['id', 'name', 'email', 'role']);
    }
}

