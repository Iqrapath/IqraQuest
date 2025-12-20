<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherReassignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $booking;
    protected $oldTeacher;
    protected $newTeacher;
    protected $reason;
    protected $recipientType; // 'student', 'old_teacher', 'new_teacher'

    public function __construct(Booking $booking, Teacher $oldTeacher, Teacher $newTeacher, ?string $reason, string $recipientType)
    {
        $this->booking = $booking;
        $this->oldTeacher = $oldTeacher;
        $this->newTeacher = $newTeacher;
        $this->reason = $reason;
        $this->recipientType = $recipientType;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)->greeting('Assalamu Alaikum ' . $notifiable->name . ',');

        if ($this->recipientType === 'student') {
            $mail->subject('Teacher Change for Your Upcoming Class')
                ->line('Your upcoming class has been reassigned to a new teacher.')
                ->line('**Previous Teacher:** ' . $this->oldTeacher->user->name)
                ->line('**New Teacher:** ' . $this->newTeacher->user->name)
                ->line('**Subject:** ' . $this->booking->subject->name)
                ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a'));
            
            if ($this->reason) {
                $mail->line('**Reason:** ' . $this->reason);
            }
            
            $mail->action('View My Bookings', url('/student/dashboard'))
                ->line('We apologize for any inconvenience. Your new teacher is equally qualified to help you.');
        } elseif ($this->recipientType === 'old_teacher') {
            $mail->subject('Class Reassignment Notice')
                ->line('A class has been reassigned from you to another teacher.')
                ->line('**Student:** ' . $this->booking->student->name)
                ->line('**Subject:** ' . $this->booking->subject->name)
                ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a'))
                ->line('**New Teacher:** ' . $this->newTeacher->user->name);
            
            if ($this->reason) {
                $mail->line('**Reason:** ' . $this->reason);
            }
            
            $mail->action('View Dashboard', url('/teacher/dashboard'))
                ->line('If you have any questions, please contact support.');
        } else { // new_teacher
            $mail->subject('New Class Assignment')
                ->line('A class has been assigned to you.')
                ->line('**Student:** ' . $this->booking->student->name)
                ->line('**Subject:** ' . $this->booking->subject->name)
                ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a'))
                ->line('**Price:** ' . $this->booking->currency . ' ' . number_format($this->booking->total_price, 2))
                ->action('View My Schedule', url('/teacher/schedule'))
                ->line('Please ensure you are available at the scheduled time.');
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        $messages = [
            'student' => 'Your class has been reassigned to ' . $this->newTeacher->user->name,
            'old_teacher' => 'Your class with ' . $this->booking->student->name . ' has been reassigned',
            'new_teacher' => 'A new class with ' . $this->booking->student->name . ' has been assigned to you',
        ];

        return [
            'booking_id' => $this->booking->id,
            'title' => 'Teacher Reassigned',
            'old_teacher_name' => $this->oldTeacher->user->name,
            'new_teacher_name' => $this->newTeacher->user->name,
            'student_name' => $this->booking->student->name,
            'start_time' => $this->booking->start_time,
            'message' => $messages[$this->recipientType] ?? 'Teacher has been reassigned for a booking',
            'type' => 'teacher_reassigned',
            'reason' => $this->reason,
        ];
    }
}
