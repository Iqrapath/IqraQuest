<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Centralized service for booking status queries.
 * Works for Students, Guardians, and Teachers with consistent logic.
 */
class BookingStatusService
{
    /**
     * Status categories for bookings
     */
    public const STATUS_UPCOMING = 'upcoming';
    public const STATUS_ONGOING = 'ongoing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_ALL = 'all';

    /**
     * Get bookings for a user filtered by status category
     */
    public function getBookings(
        User $user,
        string $status = self::STATUS_ALL,
        int $perPage = 10,
        bool $paginate = true
    ): Collection|LengthAwarePaginator {
        $query = $this->buildBaseQuery($user);
        $query = $this->applyStatusFilter($query, $status);
        $query = $this->applyDefaultRelations($query);
        $query = $this->applyDefaultOrdering($query, $status);

        return $paginate ? $query->paginate($perPage) : $query->get();
    }

    /**
     * Get upcoming bookings (confirmed, start_time in future)
     */
    public function getUpcomingBookings(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $this->getBookings($user, self::STATUS_UPCOMING, $perPage);
    }

    /**
     * Get ongoing bookings (confirmed, currently in session time window)
     */
    public function getOngoingBookings(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $this->getBookings($user, self::STATUS_ONGOING, $perPage);
    }

    /**
     * Get completed bookings
     */
    public function getCompletedBookings(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $this->getBookings($user, self::STATUS_COMPLETED, $perPage);
    }

    /**
     * Get cancelled bookings
     */
    public function getCancelledBookings(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $this->getBookings($user, self::STATUS_CANCELLED, $perPage);
    }

    /**
     * Get counts for all status categories
     */
    public function getStatusCounts(User $user): array
    {
        $baseQuery = $this->buildBaseQuery($user);

        return [
            'upcoming' => (clone $baseQuery)->where(fn($q) => $this->applyUpcomingConditions($q))->count(),
            'ongoing' => (clone $baseQuery)->where(fn($q) => $this->applyOngoingConditions($q))->count(),
            'completed' => (clone $baseQuery)->where(fn($q) => $this->applyCompletedConditions($q))->count(),
            'cancelled' => (clone $baseQuery)->where('status', 'cancelled')->count(),
        ];
    }

    /**
     * Check if a booking is currently ongoing
     */
    public function isOngoing(Booking $booking): bool
    {
        $now = now();
        return $booking->status === 'confirmed'
            && $booking->start_time->lte($now)
            && $booking->end_time->gte($now);
    }

    /**
     * Check if a booking is upcoming
     */
    public function isUpcoming(Booking $booking): bool
    {
        return in_array($booking->status, ['confirmed', 'awaiting_approval'])
            && $booking->start_time->gt(now());
    }

    /**
     * Check if a booking is completed
     */
    public function isCompleted(Booking $booking): bool
    {
        return $booking->status === 'completed';
    }

    /**
     * Get the display status for a booking
     */
    public function getDisplayStatus(Booking $booking): string
    {
        if ($booking->status === 'cancelled') {
            return 'cancelled';
        }

        if ($booking->status === 'completed') {
            return 'completed';
        }

        if ($booking->status === 'awaiting_judgment') {
            return 'in_review';
        }

        if ($booking->status === 'awaiting_approval') {
            return 'awaiting_approval';
        }

        if ($booking->status === 'awaiting_payment') {
            return 'awaiting_payment';
        }

        if ($booking->status === 'disputed') {
            return 'disputed';
        }

        if ($booking->status === 'rescheduling') {
            return 'rescheduling';
        }

        // For confirmed bookings, check time-based status
        if ($booking->status === 'confirmed') {
            $now = now();

            if ($booking->start_time->gt($now)) {
                return 'upcoming';
            }

            if ($booking->start_time->lte($now) && $booking->end_time->gte($now)) {
                return 'ongoing';
            }
        }

        return $booking->status;
    }

    /**
     * Build base query based on user role
     */
    protected function buildBaseQuery(User $user): Builder
    {
        // If user is a teacher, query by teacher_id
        if ($user->teacher) {
            return Booking::query()->where('teacher_id', $user->teacher->id);
        }

        // For students and guardians, query by user_id
        // Also check student_id if the user is a child/student attendee
        return Booking::query()->where(function ($query) use ($user) {
            $query->where('user_id', $user->id);
            if ($user->student) {
                $query->orWhere('student_id', $user->student->id);
            }
        });
    }

    /**
     * Apply status filter to query
     */
    protected function applyStatusFilter(Builder $query, string $status): Builder
    {
        return match ($status) {
            self::STATUS_UPCOMING => $query->where(fn($q) => $this->applyUpcomingConditions($q)),
            self::STATUS_ONGOING => $query->where(fn($q) => $this->applyOngoingConditions($q)),
            self::STATUS_COMPLETED => $query->where(fn($q) => $this->applyCompletedConditions($q)),
            self::STATUS_CANCELLED => $query->where('status', 'cancelled'),
            default => $query,
        };
    }

    /**
     * Apply upcoming conditions
     * Upcoming = confirmed/awaiting_approval AND start_time > now
     */
    protected function applyUpcomingConditions(Builder $query): Builder
    {
        return $query->whereIn('status', ['confirmed', 'awaiting_approval', 'rescheduling'])
            ->where('start_time', '>', now());
    }

    /**
     * Apply ongoing conditions
     * Ongoing = confirmed AND start_time <= now AND end_time >= now
     */
    protected function applyOngoingConditions(Builder $query): Builder
    {
        $now = now();
        return $query->where(function ($q) {
            $q->where('status', 'ongoing')
                ->orWhere('status', 'confirmed');
        })
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now);
    }

    protected function applyCompletedConditions(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('status', 'completed')
                ->orWhere('status', 'awaiting_judgment')
                ->orWhere(function ($sq) {
                    $sq->whereIn('status', ['confirmed', 'ongoing'])
                        ->where('end_time', '<', now());
                });
        });
    }

    /**
     * Apply default relations for booking display
     */
    protected function applyDefaultRelations(Builder $query): Builder
    {
        return $query->with([
            'teacher.user:id,name,avatar',
            'student:id,name,avatar',
            'child.user:id,name,avatar',
            'subject:id,name',
        ]);
    }

    /**
     * Apply default ordering based on status
     */
    protected function applyDefaultOrdering(Builder $query, string $status): Builder
    {
        return match ($status) {
            self::STATUS_UPCOMING => $query->orderBy('start_time', 'asc'),
            self::STATUS_ONGOING => $query->orderBy('start_time', 'asc'),
            self::STATUS_COMPLETED => $query->orderBy('end_time', 'desc'),
            self::STATUS_CANCELLED => $query->orderBy('updated_at', 'desc'),
            default => $query->orderBy('start_time', 'desc'),
        };
    }

    /**
     * Format booking for API/frontend response
     */
    public function formatBookingForResponse(Booking $booking, ?User $viewer = null): array
    {
        $isTeacher = $viewer?->teacher && $booking->teacher_id === $viewer->teacher->id;

        // Get existing review for this booking
        $existingReview = null;
        if ($viewer && !$isTeacher) {
            $review = \App\Models\Review::where('booking_id', $booking->id)
                ->where('user_id', $viewer->id)
                ->first();

            if ($review) {
                $existingReview = [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->toIso8601String(),
                ];
            }
        }

        // Get global date format and map to PHP format
        $globalFormat = \App\Models\SystemSetting::get('date_format', 'DD/MMM/YYYY');
        $phpFormat = str_replace(
            ['DD', 'MMMM', 'MMM', 'MM', 'YYYY', 'YY'],
            ['d', 'F', 'M', 'm', 'Y', 'y'],
            $globalFormat
        );

        return [
            'id' => $booking->id,
            'subject' => [
                'id' => $booking->subject->id,
                'name' => $booking->subject->name,
            ],
            'teacher' => [
                'id' => $booking->teacher->id,
                'name' => $booking->teacher->user->name,
                'avatar' => $booking->teacher->user->avatar_url,
            ],
            'student' => $booking->child ? [
                'id' => $booking->child->id,
                'name' => $booking->child->user->name,
                'avatar' => $booking->child->user->avatar_url,
            ] : [
                'id' => $booking->student->id,
                'name' => $booking->student->name,
                'avatar' => $booking->student->avatar_url,
            ],
            'start_time' => $booking->start_time->toIso8601String(),
            'end_time' => $booking->end_time->toIso8601String(),
            'formatted_date' => $booking->start_time->format($phpFormat),
            'formatted_time' => $booking->start_time->setTimezone(request()->user()?->timezone ?? config('app.timezone'))->format('g:i A') . ' - ' . $booking->end_time->setTimezone(request()->user()?->timezone ?? config('app.timezone'))->format('g:i A'),
            'duration_minutes' => $booking->start_time->diffInMinutes($booking->end_time),
            'status' => $booking->status,
            'display_status' => $this->getDisplayStatus($booking),
            'payment_status' => $booking->payment_status,
            'total_price' => (float) $booking->total_price,
            'currency' => $booking->currency,
            'can_cancel' => $booking->canBeCancelledByStudent(),
            'can_reschedule' => $booking->canBeRescheduled(),
            'can_dispute' => $booking->canBeDisputed(),
            'can_join' => $this->canJoinSession($booking),
            'can_rate' => !$isTeacher && $this->isCompleted($booking) && !$this->hasRated($booking, $viewer),
            'has_review' => $existingReview !== null,
            'review' => $existingReview,
            'meeting_link' => $booking->meeting_link,
            'parent_booking_id' => $booking->parent_booking_id,
            'judgment_reason' => $booking->judgment_reason,
            'payment_info' => $this->getPaymentInfoForResponse($booking, $isTeacher),
            'created_at' => $booking->created_at->toIso8601String(),
        ];
    }

    /**
     * Get detailed payment info for teacher transparency
     */
    protected function getPaymentInfoForResponse(Booking $booking, bool $isTeacher): array
    {
        $status = $booking->payment_status;
        $bookingStatus = $booking->status;

        $info = [
            'status' => $status,
            'label' => ucfirst($status),
            'description' => '',
            'color' => 'gray',
        ];

        if (!$isTeacher) {
            return $info; // Basic info for students
        }

        // Teacher-specific descriptive labels
        if ($status === 'held') {
            if ($bookingStatus === 'awaiting_judgment') {
                $info['label'] = 'In Review';
                $info['description'] = 'Session just ended. Our system is verifying attendance...';
                $info['color'] = 'amber';
            } else {
                $info['label'] = 'Secured in Escrow';
                $info['description'] = 'Payment is locked and will be released after the session.';
                $info['color'] = 'teal';
            }
        } elseif ($status === 'released') {
            $info['label'] = 'Paid';
            $info['description'] = 'Funds have been credited to your wallet.';
            $info['color'] = 'green';
        } elseif ($status === 'refunded') {
            $info['label'] = 'Refunded';
            $info['description'] = 'Payment was returned to the student.';
            $info['color'] = 'red';
        } elseif ($status === 'disputed') {
            $info['label'] = 'Disputed';
            $info['description'] = 'Payment is on hold due to an open dispute.';
            $info['color'] = 'orange';
        }

        return $info;
    }

    /**
     * Check if session can be joined (within 15 min before start to end time)
     */
    public function canJoinSession(Booking $booking): bool
    {
        if (!in_array($booking->status, ['confirmed', 'ongoing'])) {
            return false;
        }

        $now = now();
        $joinWindowStart = $booking->start_time->copy()->subMinutes(15);

        return $now->gte($joinWindowStart) && $now->lte($booking->end_time);
    }

    /**
     * Check if user has already rated this booking
     */
    protected function hasRated(Booking $booking, ?User $user): bool
    {
        if (!$user)
            return true;

        return \App\Models\Review::where('booking_id', $booking->id)
            ->where('user_id', $user->id)
            ->exists();
    }
}

