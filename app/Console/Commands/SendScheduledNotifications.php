<?php

namespace App\Console\Commands;

use App\Models\AdminBroadcast;
use App\Notifications\AdminBroadcastNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class SendScheduledNotifications extends Command
{
    protected $signature = 'notifications:send-scheduled';
    protected $description = 'Send scheduled admin broadcast notifications';

    public function handle(): int
    {
        $broadcasts = AdminBroadcast::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->get();

        if ($broadcasts->isEmpty()) {
            $this->info('No scheduled notifications to send.');
            return Command::SUCCESS;
        }

        foreach ($broadcasts as $broadcast) {
            $this->info("Sending broadcast: {$broadcast->title}");
            
            $users = $broadcast->getTargetUsers();
            
            $broadcast->update([
                'total_recipients' => $users->count(),
                'sent_at' => now(),
                'status' => 'sent',
            ]);
            
            Notification::send($users, new AdminBroadcastNotification($broadcast));
            
            $broadcast->update(['delivered_count' => $users->count()]);
            
            $this->info("Sent to {$users->count()} users.");
            
            // Handle recurring notifications
            if ($broadcast->frequency !== 'one_time') {
                $nextSchedule = match ($broadcast->frequency) {
                    'daily' => now()->addDay(),
                    'weekly' => now()->addWeek(),
                    default => null,
                };
                
                if ($nextSchedule) {
                    AdminBroadcast::create([
                        'title' => $broadcast->title,
                        'message' => $broadcast->message,
                        'type' => $broadcast->type,
                        'target_audience' => $broadcast->target_audience,
                        'target_user_ids' => $broadcast->target_user_ids,
                        'frequency' => $broadcast->frequency,
                        'scheduled_at' => $nextSchedule,
                        'status' => 'scheduled',
                        'created_by' => $broadcast->created_by,
                    ]);
                    
                    $this->info("Next occurrence scheduled for: {$nextSchedule}");
                }
            }
        }

        return Command::SUCCESS;
    }
}
