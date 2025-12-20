<?php

namespace App\Notifications;

use App\Models\RescheduleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RescheduleRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected RescheduleRequest $rescheduleRequest;
    protected ?string $rejectionReason;

    public function __construct(RescheduleRequest $rescheduleRequest, ?string $rejectionReason = null)
    {
        $this->rescheduleRequest = $rescheduleRequest;
        $this->rejectionReason = $rejectionReason;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->rescheduleRequest->booking;
        $teacher = $booking->teacher->user;
        $subject = $booking->subject;

        $originalDate = $this->rescheduleRequest->original_start_time->format('l, F j, Y');
        $originalTime = $this->rescheduleRequest->original_start_time->format('g:i A');

        $message = (new MailMessage)
            ->subject('Reschedule Request Declined - ' . $subject->name)
            ->greeting('Assalamu Alaikum ' . $notifiable->name . ',')
            ->line('Unfortunately, your reschedule request has been declined by Ustadh ' . $teacher->name . '.');

        if ($this->rejectionReason) {
            $message->line('**Reason:** ' . $this->rejectionReason);
        }

        return $message
            ->line('Your original booking remains scheduled:')
            ->line('📅 ' . $originalDate . ' at ' . $originalTime)
            ->line('📚 ' . $subject->name)
            ->action('View Booking', url('/student/bookings'))
            ->line('If you need to cancel, you can do so from your bookings page.');
    }

    public function toArray(object $notifiable): array
    {
        $booking = $this->rescheduleRequest->booking;

        return [
            'type' => 'reschedule_rejected',
            'reschedule_request_id' => $this->rescheduleRequest->id,
            'booking_id' => $booking->id,
            'teacher_name' => $booking->teacher->user->name,
            'subject_name' => $booking->subject->name,
            'rejection_reason' => $this->rejectionReason,
            'message' => 'Your reschedule request for ' . $booking->subject->name . ' was declined',
        ];
    }
}
