import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

interface Booking {
    id: number;
    student_name: string;
    action_text?: string; // Optional custom text if backend provides it
    status: string;
    subject: string;
    student_avatar: string | null;
}

interface RecentBookingsListProps {
    bookings: Booking[];
}

export default function RecentBookingsList({ bookings }: RecentBookingsListProps) {

    // Helper to generate descriptive text
    const getBookingText = (booking: Booking) => {
        // This logic mimics the "User enrolled in..." style
        // We can refine this based on status or type
        if (booking.status === 'scheduled') {
            return (
                <span className="text-sm text-[#101928] font-['Nunito']">
                    <strong>{booking.student_name}</strong> booked a <strong>{booking.subject}</strong> session
                </span>
            );
        } else if (booking.status === 'cancelled') {
            return (
                <span className="text-sm text-[#101928] font-['Nunito']">
                    <strong>{booking.student_name}</strong> cancelled <strong>{booking.subject}</strong>
                </span>
            );
        }
        return (
            <span className="text-sm text-[#101928] font-['Nunito']">
                <strong>{booking.student_name}</strong> - {booking.status} <strong>{booking.subject}</strong>
            </span>
        );
    };

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[#101928] font-['Nunito']">Recent Bookings</h2>
                <p className="text-gray-500 text-sm font-['Nunito'] mt-1">You have {bookings.length} new bookings</p>
            </div>

            <div className="flex flex-col gap-6 flex-1">
                {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-start gap-4">
                        <img
                            src={booking.student_avatar || `https://ui-avatars.com/api/?name=${booking.student_name}&background=random`}
                            alt={booking.student_name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="mt-1">
                            {getBookingText(booking)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <Link
                    href="/admin/bookings"
                    className="text-[#338078] font-bold text-sm font-['Nunito'] hover:underline"
                >
                    View All Bookings
                </Link>
            </div>
        </div>
    );
}
