<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'site_name' => $siteName = \App\Models\SystemSetting::get('site_name', config('app.name')),
            'site_logo' => \App\Models\SystemSetting::get('site_logo') 
                ? asset('storage/' . \App\Models\SystemSetting::get('site_logo')) 
                : null,
            'name' => $siteName,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'wallet_balance' => $request->user()?->wallet()->value('balance') ?? 0,
                'wallet_currency' => $request->user()?->wallet?->currency ?? 'NGN',
                'payment_gateways_currencies' => [
                    'paystack' => config('services.paystack.currency', 'NGN'),
                    'paypal' => 'USD',
                ],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                'payment_amount' => $request->session()->get('payment_amount'),
                'payment_currency' => $request->session()->get('payment_currency'),
            ],
            'notifications' => $request->user() 
                ? $request->user()->notifications()->latest()->take(10)->get()->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'data' => $notification->data,
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at->toISOString(),
                    ];
                })->values()->toArray()
                : [],
            'unreadNotificationsCount' => $request->user() 
                ? $request->user()->unreadNotifications()->count()
                : 0,
            'unreadMessagesCount' => $request->user()
                ? \App\Models\Message::whereHas('conversation', function ($q) use ($request) {
                    $q->where('user_one_id', $request->user()->id)
                      ->orWhere('user_two_id', $request->user()->id);
                })
                ->where('sender_id', '!=', $request->user()->id)
                ->whereNull('read_at')
                ->count()
                : 0,
            'pendingRequestsCount' => ($request->user() && $request->user()->isTeacher() && $request->user()->teacher)
                ? \App\Models\Booking::where('teacher_id', $request->user()->teacher->id)
                    ->whereIn('status', ['awaiting_approval', 'rescheduling'])
                    ->count()
                : 0,
            'dueSessionsCount' => ($request->user() && $request->user()->isTeacher() && $request->user()->teacher)
                ? \App\Models\Booking::where('teacher_id', $request->user()->teacher->id)
                    ->where('status', 'confirmed') // Only confirmed sessions can be "due"
                    ->where('start_time', '<=', now()->addMinutes(15))
                    ->where('end_time', '>=', now())
                    ->count()
                : 0,
            'studentDueSessionsCount' => ($request->user() && $request->user()->isStudent())
                ? \App\Models\Booking::where('user_id', $request->user()->id)
                    ->whereIn('status', ['confirmed', 'rescheduling'])
                    ->where('start_time', '<=', now()->addMinutes(15))
                    ->where('end_time', '>=', now())
                    ->count()
                : 0,
            'guardianDueSessionsCount' => ($request->user() && $request->user()->isGuardian() && $request->user()->guardian)
                ? \App\Models\Booking::whereIn('user_id', $request->user()->guardian->students()->pluck('user_id'))
                    ->whereIn('status', ['confirmed', 'rescheduling'])
                    ->where('start_time', '<=', now()->addMinutes(15))
                    ->where('end_time', '>=', now())
                    ->count()
                : 0,
            'pendingTeacherApplicationsCount' => ($request->user() && $request->user()->isAdmin())
                ? \App\Models\Teacher::where('status', 'pending')->count()
                : 0,
            'pendingPayoutsCount' => ($request->user() && $request->user()->isAdmin())
                ? \App\Models\Payout::where('status', 'pending')->count()
                : 0,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
