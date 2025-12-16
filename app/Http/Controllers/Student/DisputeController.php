<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\DisputeRaisedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DisputeController extends Controller
{
    /**
     * Raise a dispute for a booking
     */
    public function store(Request $request, Booking $booking)
    {
        // Verify ownership
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to dispute this booking.');
        }

        // Validate request
        $validated = $request->validate([
            'reason' => 'required|string|min:20|max:1000',
        ], [
            'reason.required' => 'Please provide a reason for the dispute.',
            'reason.min' => 'Please provide more details (at least 20 characters).',
        ]);

        // Check if booking can be disputed
        if (!$booking->canBeDisputed()) {
            return back()->with('error', 'This booking cannot be disputed. The dispute window may have expired.');
        }

        // Raise the dispute
        $booking->raiseDispute($validated['reason']);

        // Notify teacher
        try {
            $booking->teacher->user->notify(new DisputeRaisedNotification($booking));
        } catch (\Exception $e) {
            \Log::error("Failed to send dispute notification: " . $e->getMessage());
        }

        // Notify admins
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            try {
                $admin->notify(new DisputeRaisedNotification($booking));
            } catch (\Exception $e) {
                \Log::error("Failed to send admin dispute notification: " . $e->getMessage());
            }
        }

        return back()->with('success', 'Dispute raised successfully. Our team will review it within 24-48 hours.');
    }
}
