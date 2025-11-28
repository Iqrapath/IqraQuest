<?php

namespace App\Listeners;

use App\Models\SecurityLog;
use Illuminate\Auth\Events\Logout;

class LogLogout
{
    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        $request = request();

        SecurityLog::logEvent(
            eventType: 'logout',
            ipAddress: $request->ip(),
            userId: $event->user->id,
            description: 'User logged out',
            metadata: [
                'user_agent' => $request->userAgent(),
                'guard' => $event->guard,
            ],
            severity: 'info'
        );
    }
}
