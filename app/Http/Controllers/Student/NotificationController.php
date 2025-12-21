<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display the notifications page
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get all notifications with pagination
        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        // Categorize notifications
        $paymentTypes = [
            'App\\Notifications\\FundsReleasedNotification',
            'App\\Notifications\\FundsRefundedNotification',
            'App\\Notifications\\AutoPayoutProcessedNotification',
            'App\\Notifications\\AutoPayoutFailedNotification',
        ];

        return Inertia::render('Student/Notifications/Index', [
            'paginatedNotifications' => $notifications->through(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->toISOString(),
                    'created_at_human' => $notification->created_at->diffForHumans(),
                ];
            }),
            'paymentTypes' => $paymentTypes,
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return back();
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, string $id)
    {
        $request->user()
            ->notifications()
            ->where('id', $id)
            ->delete();

        return back();
    }

    /**
     * Delete all notifications
     */
    public function destroyAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return back();
    }
}
