<?php

namespace App\Mail;

use App\Models\MatchRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeacherRecommendationMail extends Mailable
{
    use Queueable, SerializesModels;

    public MatchRequest $matchRequest;
    public array $recommendations;

    /**
     * Create a new message instance.
     */
    public function __construct(MatchRequest $matchRequest, array $recommendations)
    {
        $this->matchRequest = $matchRequest;
        $this->recommendations = $recommendations;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Personalized Quran Teacher Recommendations - IqraQuest',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.teacher-recommendations',
            with: [
                'name' => $this->matchRequest->name,
                'subjectName' => $this->matchRequest->subject_name,
                'timePreference' => $this->getTimeLabel($this->matchRequest->time_preference),
                'recommendations' => $this->recommendations,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Get human-readable time preference label
     */
    protected function getTimeLabel(string $preference): string
    {
        return match ($preference) {
            'morning' => 'Morning (6AM - 12PM)',
            'afternoon' => 'Afternoon (12PM - 6PM)',
            'evening' => 'Evening (6PM - 10PM)',
            'flexible' => 'Flexible',
            default => $preference,
        };
    }
}
