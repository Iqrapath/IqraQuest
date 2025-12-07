<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\SecurityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $userRole = $request->user()->role->value;
        
        \Illuminate\Support\Facades\Log::info('EnsureUserHasRole Check', [
            'user_id' => $request->user()->id,
            'user_role' => $userRole,
            'required_roles' => $roles,
            'url' => $request->fullUrl(),
            'route_name' => $request->route()->getName(),
        ]);

        if (! in_array($userRole, $roles)) {
            // Log unauthorized role access attempt
            SecurityLog::logEvent(
                eventType: 'unauthorized_role_access',
                ipAddress: $request->ip(),
                userId: $request->user()->id,
                description: "User with role '{$userRole}' attempted to access route requiring roles: ".implode(', ', $roles),
                metadata: [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_role' => $userRole,
                    'required_roles' => $roles,
                    'user_agent' => $request->userAgent(),
                ],
                severity: 'warning'
            );

            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
