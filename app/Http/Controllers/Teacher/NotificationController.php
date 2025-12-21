<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        $paymentTypes = [
            'App\\Notifications\\FundsReleasedNotification',
            'App\\Notifications\\FundsRefundedNotification',
            'App\\Notifications\\AutoPayoutProcessedNotification',
            'App\\Notifications\\AutoPayoutFailedNotification',
        ];

        return Inertia::render('Teacher/Notifications/Index', [
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

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }

    public function destroy(Request $request, string $id)
    {
        $request->user()
            ->notifications()
            ->where('id', $id)
            ->delete();

        return back();
    }

    public function destroyAll(Request $request)
    {
        $request->user()->notifications()->delete();
        return back();
    }
}
