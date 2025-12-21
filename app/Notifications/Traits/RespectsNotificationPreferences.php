<?php

namespace App\Notifications\Traits;

use App\Models\UserSettings;

/**
 * Trait to check user notification preferences before sending.
 * 
 * Usage in notification class:
 *   use RespectsNotificationPreferences;
 *   
 *   public function via(object $notifiable): array
 *   {
 *       return $this->getChannels($notifiable, 'session'); // or 'message', 'payment', 'general'
 *   }
 */
trait RespectsNotificationPreferences
{
    /**
     * Get notification channels based on user preferences.
     *
     * @param object $notifiable The user receiving the notification
     * @param string $type The type of notification: 'message', 'session', 'payment', or 'general'
     * @return array The channels to use
     */
    protected function getChannels(object $notifiable, string $type = 'general'): array
    {
        $channels = [];
        $settings = $this->getUserSettings($notifiable);

        // Check if this specific notification type is enabled
        if (!$this->isNotificationTypeEnabled($settings, $type)) {
            // If the specific type is disabled, still allow database for record-keeping
            // but skip email and other push notifications
            return ['database'];
        }

        // Add database/in-app notification if mobile alerts are enabled
        if ($settings?->mobile_alerts ?? true) {
            $channels[] = 'database';
        }

        // Add email if email notifications are enabled
        if ($settings?->email_notifications ?? true) {
            $channels[] = 'mail';
        }

        // Always have at least database as fallback for record-keeping
        if (empty($channels)) {
            $channels[] = 'database';
        }

        return $channels;
    }

    /**
     * Get channels for broadcast notifications (real-time).
     * This includes the broadcast channel for real-time updates.
     */
    protected function getChannelsWithBroadcast(object $notifiable, string $type = 'general'): array
    {
        $channels = $this->getChannels($notifiable, $type);
        $settings = $this->getUserSettings($notifiable);

        // Add broadcast if mobile alerts are enabled (real-time push)
        if ($settings?->mobile_alerts ?? true) {
            $channels[] = 'broadcast';
        }

        return array_unique($channels);
    }

    /**
     * Check if a specific notification type is enabled.
     */
    protected function isNotificationTypeEnabled(?UserSettings $settings, string $type): bool
    {
        if (!$settings) {
            return true; // Default to enabled if no settings exist
        }

        return match ($type) {
            'message' => $settings->alert_new_messages ?? true,
            'session' => $settings->alert_session_requests ?? true,
            'payment' => $settings->alert_payment_updates ?? true,
            'general' => true, // General notifications always enabled
            default => true,
        };
    }

    /**
     * Get user settings from the notifiable.
     */
    protected function getUserSettings(object $notifiable): ?UserSettings
    {
        if (!method_exists($notifiable, 'getOrCreateSettings')) {
            return null;
        }

        return $notifiable->settings ?? $notifiable->getOrCreateSettings();
    }

    /**
     * Check if email notifications are enabled for the user.
     */
    protected function shouldSendEmail(object $notifiable): bool
    {
        $settings = $this->getUserSettings($notifiable);
        return $settings?->email_notifications ?? true;
    }

    /**
     * Check if in-app/mobile alerts are enabled for the user.
     */
    protected function shouldSendInApp(object $notifiable): bool
    {
        $settings = $this->getUserSettings($notifiable);
        return $settings?->mobile_alerts ?? true;
    }
}
