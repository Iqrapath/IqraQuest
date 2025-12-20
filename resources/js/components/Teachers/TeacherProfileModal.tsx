import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';

interface Teacher {
    id: number;
    user: {
        name: string;
        avatar?: string;
    };
    bio: string;
    experience_years: number;
    hourly_rate: number | null;
    subjects: Array<{
        id: number;
        name: string;
        proficiency_level: string;
    }>;
    average_rating: number;
    total_reviews: number;
    location?: string;
    city?: string;
    isCertified?: boolean;
    qualifications?: string;
    specializations?: any;
    teaching_mode?: string;
    preferred_currency?: string;
    payment_methods?: string[];
    availability_schedule?: Array<{
        day_of_week: string;
        start_time: string | null;
        end_time: string | null;
        is_available: boolean;
    }>;
    reviews?: Array<{
        id: number;
        user: { name: string; avatar?: string };
        rating: number;
        comment: string;
        created_at: string;
    }>;
}

interface TeacherProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: number;
    hideBookNow?: boolean;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
    isOpen,
    onClose,
    teacherId,
    hideBookNow = false,
}) => {
    const [activeTab, setActiveTab] = useState('bio');
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch teacher details when modal opens
    useEffect(() => {
        if (isOpen && teacherId) {
            fetchTeacherDetails();
        }
    }, [isOpen, teacherId]);

    const fetchTeacherDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/teachers/${teacherId}`);
            setTeacher(response.data.teacher);
        } catch (error) {
            console.error('Failed to fetch teacher details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'bio', label: 'Bio & Experience' },
        { id: 'availability', label: 'Availability Calendar' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'reviews', label: 'Ratings & Reviews' },
    ];

    if (!teacher && isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] w-full max-w-xl p-0 sm:max-w-2xl bg-white" aria-describedby={undefined}>
                    <DialogTitle className="sr-only">Loading Teacher Profile</DialogTitle>
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-center">
                            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <p className="text-sm text-gray-500">Loading teacher profile...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!teacher) {
        return null;
    }

    const avatarSrc = teacher.user.avatar
        ? `/storage/${teacher.user.avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}&background=338078&color=fff&size=400`;

    const location = teacher.city || teacher.location || 'Location not specified';
    const availabilityText = teacher.teaching_mode || 'Contact for schedule';

    // Helper to format currency
    const formatCurrency = (amount: number | null, currency: string = 'NGN') => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Helper to format time (08:00:00 -> 08:00 AM)
    const formatTime = (timeString: string | null) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const experienceBullets = [
        `Teaching for ${teacher.experience_years}+ years`,
        teacher.subjects.length > 0
            ? `Specializes in ${teacher.subjects.map(s => s.name).slice(0, 3).join(', ')}`
            : 'Specializes in personalized learning',
        `Rated ${teacher.average_rating > 0 ? teacher.average_rating.toFixed(1) : 'New'} stars by students`
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-full max-w-xl overflow-y-auto p-0 sm:max-w-2xl bg-white border-0 shadow-xl rounded-3xl" aria-describedby={undefined}>
                <DialogTitle className="sr-only">Teacher Profile: {teacher.user.name}</DialogTitle>
                {/* Header Section */}
                <div className="border-b border-gray-100 p-6 pb-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        {/* Left: Avatar & Badge */}
                        <div className="flex flex-col items-center gap-3 sm:items-start">
                            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-3xl bg-gray-100">
                                <img
                                    src={avatarSrc}
                                    alt={teacher.user.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/* Certified Badge */}
                            {teacher.isCertified && (
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5">
                                    <Icon icon="mdi:check-circle" className="h-3.5 w-3.5 text-teal-600" />
                                    <span className="text-xs font-medium text-teal-700">
                                        Certified Quran Tutor
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right: Teacher Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                                {teacher.user.name}
                            </h2>

                            {/* Location */}
                            <div className="mb-2 flex items-center justify-center gap-1.5 text-gray-600 sm:justify-start">
                                <Icon icon="mdi:map-marker-outline" className="h-4 w-4" />
                                <span className="text-sm">{location}</span>
                            </div>

                            {/* Rating */}
                            <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, index) => (
                                        <Icon
                                            key={index}
                                            icon="mdi:star"
                                            className={`h-5 w-5 ${index < Math.floor(teacher.average_rating)
                                                ? 'text-[#FDB022]'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {teacher.average_rating > 0 ? teacher.average_rating.toFixed(1) : '0.0'}/5 from {teacher.total_reviews} Students
                                </span>
                            </div>

                            {/* Subjects */}
                            <div className="mb-2 text-sm">
                                <span className="text-gray-500">Subjects Taught: </span>
                                <span className="font-medium text-gray-900">
                                    {teacher.subjects.map(s => s.name).join(', ')}
                                </span>
                            </div>

                            {/* Availability */}
                            <div className="text-sm">
                                <span className="text-gray-500">Availability: </span>
                                <span className="font-semibold text-gray-900 capitalize">
                                    {availabilityText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-gray-100 px-6">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative whitespace-nowrap pb-3 pt-4 text-sm font-semibold transition-colors ${activeTab === tab.id
                                    ? 'text-[#00A991]'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00A991] rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px] px-6 py-6">
                    {activeTab === 'bio' && (
                        <div className="space-y-6">
                            <p className="text-sm leading-7 text-gray-600">
                                {teacher.bio || 'No bio available provided by teacher.'}
                            </p>

                            <div>
                                <h3 className="mb-4 text-base font-semibold text-gray-900">
                                    Experience & Teaching Style:
                                </h3>
                                <ul className="space-y-3">
                                    {experienceBullets.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-900" />
                                            <span className="text-sm text-gray-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'availability' && (
                        <div className="space-y-6">
                            {/* Calendar Removed: Detailed availability is shown below */}

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Availability Time: <span className="font-normal text-gray-600 capitalize">{teacher.teaching_mode || 'Flexible'}</span></h4>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {/* Dynamic Slots */}
                                    {teacher.availability_schedule && teacher.availability_schedule.length > 0 ? (
                                        teacher.availability_schedule.filter(s => s.is_available).map((slot, i) => (
                                            <div key={i} className="flex flex-col items-start gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600">
                                                <span className="font-bold text-[#00A991] capitalize">{slot.day_of_week}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#00A991]" />
                                                    <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-sm text-gray-500 italic">No specific schedule set. Please contact for availability.</div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">* Times are shown in your local timezone</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-medium text-gray-500">Session Rate:</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(teacher.hourly_rate, teacher.preferred_currency)}
                                </span>
                                <span className="text-sm text-gray-400">per session</span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-medium text-gray-500">Currency:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    USD & {teacher.preferred_currency}
                                </span>
                            </div>

                            <div>
                                <h4 className="mb-4 text-sm font-medium text-gray-500">Payment Methods:</h4>
                                <div className="flex flex-wrap gap-4">
                                    {(teacher.payment_methods || []).map((method: string) => (
                                        <div key={method} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 capitalize">
                                            <div className="bg-[#00A991] rounded p-0.5"><Icon icon="mdi:check" className="h-3 w-3 text-white" /></div>
                                            <span className="text-sm font-medium text-gray-700">{method.replace('_', ' ')}</span>
                                        </div>
                                    ))}
                                    {(!teacher.payment_methods || teacher.payment_methods.length === 0) && (
                                        <div className="text-sm text-gray-400 italic">No specific payment methods listed.</div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-4">
                                <div className="flex gap-3">
                                    <Icon icon="mdi:information-outline" className="h-5 w-5 text-orange-600 shrink-0" />
                                    <p className="text-xs leading-5 text-orange-800">
                                        Prices may vary based on the course level and duration. Book a trial session to discuss a personalized plan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:star" className="h-6 w-6 text-[#FDB022]" />
                                    <span className="text-xl font-bold text-gray-900">
                                        {teacher.average_rating > 0 ? teacher.average_rating.toFixed(1) : '0.0'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({teacher.total_reviews} Reviews)
                                    </span>
                                </div>
                                <button className="text-sm font-medium text-[#00A991] hover:underline">
                                    View all
                                </button>
                            </div>

                            <div className="space-y-6">
                                {teacher.reviews && teacher.reviews.length > 0 ? (
                                    teacher.reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                                                        <img
                                                            src={review.user.avatar ? `/storage/${review.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}&background=random`}
                                                            alt={review.user.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-Semibold text-gray-900">{review.user.name}</h4>
                                                        <p className="text-xs text-gray-400">{review.created_at}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <Icon icon="mdi:star" className="h-4 w-4 text-[#FDB022]" />
                                                    <span className="text-xs font-bold text-gray-900">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm leading-relaxed text-gray-600">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-sm text-gray-500">
                                        No reviews yet. Be the first to review!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 border-t border-gray-100 p-6 pt-4 bg-white sticky bottom-0 z-10">
                    {!hideBookNow && (
                        <Link
                            href={`/student/book/${teacher.id}`}
                            className="flex-1 flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-md shadow-teal-500/20 cursor-pointer"
                        >
                            Book Now
                        </Link>
                    )}
                    <button
                        onClick={onClose}
                        className={`flex items-center gap-2 rounded-full border-b border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:border-b-[#00A991] cursor-pointer ${hideBookNow ? 'flex-1 justify-center' : ''}`}
                    >
                        <Icon icon="mdi:message-outline" className="h-5 w-5" />
                        Send Message
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
