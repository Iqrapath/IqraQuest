<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illumie\Http\Response;
use Illuminate\Support\Facades\Auth;

class CalendarExportController extends Controller
{
    /**
     * Generate iCal (.ics) file for a single booking
     */
    public function exportBooking(Booking $booking): Response
    {
        // Verify user has access to this booking
        $this->authorizeBookingAccess($booking);

        $icsContent = $this->generateIcsContent([$booking]);

        return response($icsContent)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="session-' . $booking->id . '.ics"');
    }

    /**
     * Generate iCal (.ics) file for multiple bookings
     */
    public function exportAllBookings(Request $request): Response
    {
        $user = Auth::user();
        
        $bookings = Booking::where(function ($query) use ($user) {
                // User's own bookings (as student/guardian)
                $query->where('user_id', $user->id);
                
                // Or as teacher
                if ($user->teacher) {
                    $query->orWhere('teacher_id', $user->teacher->id);
                }
            })
            ->whereIn('status', ['confirmed', 'completed'])
            ->where('start_time', '>=', now()->subMonths(1)) // Last month + future
            ->orderBy('start_time')
            ->with(['teacher.user', 'student', 'subject'])
            ->get();

        $icsContent = $this->generateIcsContent($bookings);

        return response($icsContent)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="iqraquest-sessions.ics"');
    }

    /**
     * Generate Google Calendar URL for a booking
     */
    public function googleCalendarUrl(Booking $booking): array
    {
        $this->authorizeBookingAccess($booking);

        $url = $this->buildGoogleCalendarUrl($booking);

        return ['url' => $url];
    }

    /**
     * Generate iCal content for bookings
     */
    protected function generateIcsContent(iterable $bookings): string
    {
        $ics = "BEGIN:VCALENDAR\r\n";
        $ics .= "VERSION:2.0\r\n";
        $ics .= "PRODID:-//IqraQuest//Session Calendar//EN\r\n";
        $ics .= "CALSCALE:GREGORIAN\r\n";
        $ics .= "METHOD:PUBLISH\r\n";
        $ics .= "X-WR-CALNAME:IqraQuest Sessions\r\n";

        foreach ($bookings as $booking) {
            $ics .= $this->generateEventBlock($booking);
        }

        $ics .= "END:VCALENDAR\r\n";

        return $ics;
    }

    /**
     * Generate a single VEVENT block
     */
    protected function generateEventBlock(Booking $booking): string
    {
        $user = Auth::user();
        $isTeacher = $user->teacher && $booking->teacher_id === $user->teacher->id;
        
        $title = $this->getEventTitle($booking, $isTeacher);
        $description = $this->getEventDescription($booking, $isTeacher);
        $location = url("/classroom/{$booking->id}");

        $uid = "booking-{$booking->id}@iqraquest.com";
        $dtstamp = now()->format('Ymd\THis\Z');
        $dtstart = $booking->start_time->format('Ymd\THis\Z');
        $dtend = $booking->end_time->format('Ymd\THis\Z');
        $created = $booking->created_at->format('Ymd\THis\Z');

        $event = "BEGIN:VEVENT\r\n";
        $event .= "UID:{$uid}\r\n";
        $event .= "DTSTAMP:{$dtstamp}\r\n";
        $event .= "DTSTART:{$dtstart}\r\n";
        $event .= "DTEND:{$dtend}\r\n";
        $event .= "CREATED:{$created}\r\n";
        $event .= "SUMMARY:" . $this->escapeIcsText($title) . "\r\n";
        $event .= "DESCRIPTION:" . $this->escapeIcsText($description) . "\r\n";
        $event .= "LOCATION:" . $this->escapeIcsText($location) . "\r\n";
        $event .= "URL:" . $this->escapeIcsText($location) . "\r\n";
        $event .= "STATUS:" . $this->getIcsStatus($booking->status) . "\r\n";
        
        // Add reminder 15 minutes before
        $event .= "BEGIN:VALARM\r\n";
        $event .= "TRIGGER:-PT15M\r\n";
        $event .= "ACTION:DISPLAY\r\n";
        $event .= "DESCRIPTION:Session starting in 15 minutes\r\n";
        $event .= "END:VALARM\r\n";
        
        // Add reminder 1 hour before
        $event .= "BEGIN:VALARM\r\n";
        $event .= "TRIGGER:-PT1H\r\n";
        $event .= "ACTION:DISPLAY\r\n";
        $event .= "DESCRIPTION:Session starting in 1 hour\r\n";
        $event .= "END:VALARM\r\n";

        $event .= "END:VEVENT\r\n";

        return $event;
    }

    /**
     * Build Google Calendar URL
     */
    protected function buildGoogleCalendarUrl(Booking $booking): string
    {
        $user = Auth::user();
        $isTeacher = $user->teacher && $booking->teacher_id === $user->teacher->id;

        $title = $this->getEventTitle($booking, $isTeacher);
        $description = $this->getEventDescription($booking, $isTeacher);
        $location = url("/classroom/{$booking->id}");

        $params = [
            'action' => 'TEMPLATE',
            'text' => $title,
            'dates' => $booking->start_time->format('Ymd\THis\Z') . '/' . $booking->end_time->format('Ymd\THis\Z'),
            'details' => $description,
            'location' => $location,
            'trp' => 'false',
        ];

        return 'https://calendar.google.com/calendar/render?' . http_build_query($params);
    }

    /**
     * Get event title based on user role
     */
    protected function getEventTitle(Booking $booking, bool $isTeacher): string
    {
        $subject = $booking->subject->name ?? 'Session';
        
        if ($isTeacher) {
            return "IqraQuest: {$subject} with {$booking->student->name}";
        }
        
        return "IqraQuest: {$subject} with {$booking->teacher->user->name}";
    }

    /**
     * Get event description based on user role
     */
    protected function getEventDescription(Booking $booking, bool $isTeacher): string
    {
        $lines = [
            "Subject: {$booking->subject->name}",
            $isTeacher 
                ? "Student: {$booking->student->name}" 
                : "Teacher: {$booking->teacher->user->name}",
            "",
            "Join your session at:",
            url("/classroom/{$booking->id}"),
            "",
            "Duration: " . $booking->start_time->diffInMinutes($booking->end_time) . " minutes",
            "",
            "Powered by IqraQuest",
        ];

        return implode("\\n", $lines);
    }

    /**
     * Map booking status to iCal status
     */
    protected function getIcsStatus(string $status): string
    {
        return match ($status) {
            'confirmed' => 'CONFIRMED',
            'cancelled' => 'CANCELLED',
            'completed' => 'CONFIRMED',
            default => 'TENTATIVE',
        };
    }

    /**
     * Escape text for iCal format
     */
    protected function escapeIcsText(string $text): string
    {
        $text = str_replace(['\\', ';', ','], ['\\\\', '\\;', '\\,'], $text);
        return $text;
    }

    /**
     * Verify user has access to the booking
     */
    protected function authorizeBookingAccess(Booking $booking): void
    {
        $user = Auth::user();
        
        $hasAccess = $booking->user_id === $user->id 
            || ($user->teacher && $booking->teacher_id === $user->teacher->id);

        if (!$hasAccess) {
            abort(403, 'You do not have access to this booking.');
        }
    }
}

