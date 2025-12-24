<?php

namespace App\Notifications;

use App\Models\AdminBroadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminBroadcastNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    protected bool $sendEmail;

    public function __construct(
        protected AdminBroadcast $broadcast,
        bool $sendEmail = false
    ) {
        $this->sendEmail = $sendEmail;
    }

    public function via(object $notifiable): array
    {
        $channels = ['broadcast', 'database'];
        
        if ($this->sendEmail) {
            $channels[] = 'mail';
        }
        
        return $channels;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->replaceTemplateVariables($this->broadcast->title, $notifiable),
            'message' => $this->replaceTemplateVariables($this->broadcast->message, $notifiable),
            'type' => $this->getNotificationType(),
            'broadcast_id' => $this->broadcast->id,
            'broadcast_type' => $this->broadcast->type,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => $this->replaceTemplateVariables($this->broadcast->title, $notifiable),
            'message' => $this->replaceTemplateVariables($this->broadcast->message, $notifiable),
            'type' => $this->getNotificationType(),
            'broadcast_id' => $this->broadcast->id,
            'broadcast_type' => $this->broadcast->type,
        ]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $title = $this->replaceTemplateVariables($this->broadcast->title, $notifiable);
        $message = $this->replaceTemplateVariables($this->broadcast->message, $notifiable);
        
        return (new MailMessage)
            ->subject($title)
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . '!')
            ->line($message)
            ->line('Thank you for being part of IqraQuest!')
            ->salutation('Best regards, The IqraQuest Team');
    }

    /**
     * Replace template variables with actual user data
     */
    private function replaceTemplateVariables(string $text, object $notifiable): string
    {
        // Handle role - could be enum or string
        $role = $notifiable->role ?? 'user';
        if (is_object($role) && method_exists($role, 'value')) {
            $role = $role->value; // Get enum value
        }
        $role = is_string($role) ? ucfirst($role) : 'User';

        $replacements = [
            '[Student_Name]' => $notifiable->name ?? 'Student',
            '[Teacher_Name]' => $notifiable->name ?? 'Teacher',
            '[Guardian_Name]' => $notifiable->name ?? 'Guardian',
            '[User_Name]' => $notifiable->name ?? 'User',
            '[Email]' => $notifiable->email ?? '',
            '[Role]' => $role,
            '[Plan_Name]' => 'N/A',
            '[Plan_Price]' => 'N/A',
        ];

        // Add wallet balance if available
        if (method_exists($notifiable, 'wallet')) {
            $wallet = $notifiable->wallet;
            $replacements['[Wallet_Balance]'] = $wallet ? number_format($wallet->balance, 2) : '0.00';
        }

        return str_replace(array_keys($replacements), array_values($replacements), $text);
    }

    /**
     * Map broadcast type to notification type for frontend icons
     */
    private function getNotificationType(): string
    {
        return match ($this->broadcast->type) {
            'system' => 'system_notification',
            'announcement' => 'announcement',
            'custom' => 'admin_message',
            default => 'notification',
        };
    }
}
