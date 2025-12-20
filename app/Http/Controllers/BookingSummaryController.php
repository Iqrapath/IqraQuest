<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\BookingStatusService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class BookingSummaryController extends Controller
{
    protected BookingStatusService $bookingStatusService;

    public function __construct(BookingStatusService $bookingStatusService)
    {
        $this->bookingStatusService = $bookingStatusService;
    }

    /**
     * Download session summary as PDF
     */
    public function show(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Verify ownership
        if ($booking->user_id !== $user->id) {
            abort(403, 'You do not have access to this booking.');
        }

        // Load relationships
        $booking->load(['teacher.user', 'student', 'subject']);

        // Get review if exists
        $review = $booking->review;

        // Get display status (uses time-based logic)
        $displayStatus = $this->bookingStatusService->getDisplayStatus($booking);

        // Generate PDF
        $pdf = Pdf::loadView('bookings.summary-pdf', [
            'booking' => $booking,
            'review' => $review,
            'user' => $user,
            'displayStatus' => $displayStatus,
        ]);

        // Set paper size
        $pdf->setPaper('A4', 'portrait');

        // Download with filename
        $filename = 'session-summary-' . $booking->id . '.pdf';
        
        return $pdf->download($filename);
    }
}
