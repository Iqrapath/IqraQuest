<?php

namespace App\Console\Commands;

use App\Models\LoginAttempt;
use App\Models\SecurityLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SecurityReport extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'security:report {--days=7 : Number of days to analyze}';

    /**
     * The console command description.
     */
    protected $description = 'Generate a security report for the application';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $since = now()->subDays($days);

        $this->info("Security Report - Last {$days} Days");
        $this->newLine();

        // Login Statistics
        $this->line('=== Login Statistics ===');
        $totalAttempts = LoginAttempt::where('attempted_at', '>=', $since)->count();
        $successfulLogins = LoginAttempt::where('attempted_at', '>=', $since)
            ->where('successful', true)
            ->count();
        $failedLogins = LoginAttempt::where('attempted_at', '>=', $since)
            ->where('successful', false)
            ->count();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Login Attempts', $totalAttempts],
                ['Successful Logins', $successfulLogins],
                ['Failed Logins', $failedLogins],
                ['Success Rate', $totalAttempts > 0 ? round(($successfulLogins / $totalAttempts) * 100, 2).'%' : 'N/A'],
            ]
        );

        // Security Events
        $this->newLine();
        $this->line('=== Security Events ===');
        $events = SecurityLog::where('created_at', '>=', $since)
            ->selectRaw('event_type, severity, COUNT(*) as count')
            ->groupBy('event_type', 'severity')
            ->orderBy('count', 'desc')
            ->get();

        if ($events->isNotEmpty()) {
            $this->table(
                ['Event Type', 'Severity', 'Count'],
                $events->map(fn ($e) => [$e->event_type, $e->severity, $e->count])
            );
        } else {
            $this->info('No security events recorded.');
        }

        // Critical Events
        $criticalEvents = SecurityLog::where('created_at', '>=', $since)
            ->where('severity', 'critical')
            ->count();

        if ($criticalEvents > 0) {
            $this->newLine();
            $this->error("⚠️  {$criticalEvents} CRITICAL security events detected!");
            
            $recent = SecurityLog::where('severity', 'critical')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            $this->table(
                ['Date', 'Event', 'IP Address'],
                $recent->map(fn ($e) => [
                    $e->created_at->format('Y-m-d H:i:s'),
                    $e->event_type,
                    $e->ip_address,
                ])
            );
        }

        // Top Failed Login IPs
        $this->newLine();
        $this->line('=== Top Failed Login IPs ===');
        $topFailedIPs = LoginAttempt::where('attempted_at', '>=', $since)
            ->where('successful', false)
            ->selectRaw('ip_address, COUNT(*) as count')
            ->groupBy('ip_address')
            ->orderBy('count', 'desc')
            ->take(10)
            ->get();

        if ($topFailedIPs->isNotEmpty()) {
            $this->table(
                ['IP Address', 'Failed Attempts'],
                $topFailedIPs->map(fn ($ip) => [$ip->ip_address, $ip->count])
            );
        } else {
            $this->info('No failed login attempts.');
        }

        // Blocked IPs
        $this->newLine();
        $this->line('=== Currently Blocked IPs ===');
        $blockedCount = 0;
        $blockedIPs = [];
        
        // This is a simple check - in production you might want to store blocked IPs in database
        $this->info('Check cache for blocked IPs with key pattern: blocked_ip:*');

        $this->newLine();
        $this->info('✅ Security report generated successfully!');

        return Command::SUCCESS;
    }
}
