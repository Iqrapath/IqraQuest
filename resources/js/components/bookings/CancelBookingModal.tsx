import { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CancellationDetails {
    can_cancel: boolean;
    reason?: string;
    refund_percentage: number;
    refund_amount: number;
    cancellation_fee: number;
    total_price: number;
    currency: string;
    hours_until_session: number;
    policy_tier: string;
    is_recurring: boolean;
    child_bookings_count: number;
}

interface CancelBookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason?: string, cancelSeries?: boolean) => void;
    bookingId: number;
    subjectName: string;
    teacherName: string;
    dateTime: string;
    isLoading?: boolean;
    userRole?: 'student' | 'guardian';
}

export function CancelBookingModal({
    open,
    onOpenChange,
    onConfirm,
    bookingId,
    subjectName,
    teacherName,
    dateTime,
    isLoading = false,
    userRole = 'student',
}: CancelBookingModalProps) {
    const [cancellationDetails, setCancellationDetails] = useState<CancellationDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [reason, setReason] = useState('');
    const [cancelSeries, setCancelSeries] = useState(false);

    useEffect(() => {
        if (open && bookingId) {
            fetchCancellationDetails();
        }
    }, [open, bookingId]);

    const fetchCancellationDetails = async () => {
        setIsLoadingDetails(true);
        try {
            const response = await axios.get(`/${userRole}/booking/${bookingId}/cancellation-details`);
            setCancellationDetails(response.data);
        } catch (error) {
            console.error('Failed to fetch cancellation details:', error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const formatCurrency = (amount: number, currency: string = 'NGN') => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getPolicyMessage = () => {
        if (!cancellationDetails) return null;

        const { policy_tier, refund_percentage, hours_until_session } = cancellationDetails;

        switch (policy_tier) {
            case 'awaiting_approval':
                return {
                    type: 'success',
                    message: 'Full refund available. The teacher has not yet accepted this booking.',
                };
            case 'not_paid':
                return {
                    type: 'info',
                    message: 'No payment was made for this booking. You can cancel without any charges.',
                };
            case 'full_refund':
                return {
                    type: 'success',
                    message: `Full refund available. You're cancelling more than 24 hours before the session.`,
                };
            case 'late_tier1':
                return {
                    type: 'warning',
                    message: `75% refund. You're cancelling ${Math.round(hours_until_session)} hours before the session (12-24 hour window).`,
                };
            case 'late_tier2':
                return {
                    type: 'warning',
                    message: `50% refund. You're cancelling ${Math.round(hours_until_session)} hours before the session (6-12 hour window).`,
                };
            case 'no_refund':
                return {
                    type: 'error',
                    message: `No refund available. You're cancelling less than 6 hours before the session.`,
                };
            default:
                return null;
        }
    };

    const policyMessage = getPolicyMessage();

    const handleConfirm = () => {
        onConfirm(reason || undefined, cancelSeries);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[calc(100%-2rem)] max-w-md bg-white rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
                showCloseButton={false}
                aria-describedby={undefined}
            >
                <DialogTitle className="sr-only">Cancel Booking Confirmation</DialogTitle>

                {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <p className="text-sm text-gray-500">Loading cancellation details...</p>
                        </div>
                    </div>
                ) : cancellationDetails && !cancellationDetails.can_cancel ? (
                    /* Cannot Cancel State */
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#fde8e8] flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:close-circle-outline" className="h-8 w-8 text-[#dc2626]" />
                        </div>
                        <h2 className="font-['Poppins'] font-semibold text-xl text-[#181818] mb-2">
                            Cannot Cancel
                        </h2>
                        <p className="font-['Nunito'] text-sm text-[#6b7280] mb-6">
                            {cancellationDetails.reason}
                        </p>
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="w-full rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-sm h-11 cursor-pointer"
                        >
                            Close
                        </Button>
                    </div>
                ) : (
                    /* Can Cancel State */
                    <>
                        {/* Warning Icon */}
                        <div className="flex justify-center pt-8 pb-4">
                            <div className="w-16 h-16 rounded-full bg-[#fde8e8] flex items-center justify-center">
                                <Icon icon="mdi:alert-circle-outline" className="h-8 w-8 text-[#dc2626]" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-4 sm:px-6 pb-6 text-center">
                            <h2 className="font-['Poppins'] font-semibold text-xl text-[#181818] mb-2">
                                Cancel Booking?
                            </h2>
                            <p className="font-['Nunito'] text-sm text-[#6b7280] mb-4">
                                Are you sure you want to cancel this booking?
                            </p>

                            {/* Booking Details */}
                            <div className="bg-[#f9fafb] rounded-xl p-4 mb-4 text-left">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:book-open-page-variant" className="h-4 w-4 text-[#6b7280]" />
                                        <span className="font-['Nunito'] text-sm text-[#181818]">{subjectName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon icon="fa-solid:chalkboard-teacher" className="h-4 w-4 text-[#6b7280]" />
                                        <span className="font-['Nunito'] text-sm text-[#181818]">
                                            Ustadh {teacherName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:calendar-clock" className="h-4 w-4 text-[#6b7280]" />
                                        <span className="font-['Nunito'] text-sm text-[#181818]">{dateTime}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Information */}
                            {cancellationDetails && (
                                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 mb-4 text-left">
                                    <h4 className="font-['Poppins'] font-medium text-sm text-[#166534] mb-2">
                                        Refund Summary
                                    </h4>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between">
                                            <span className="font-['Nunito'] text-xs text-[#6b7280]">
                                                Session Price:
                                            </span>
                                            <span className="font-['Nunito'] text-xs text-[#181818]">
                                                {formatCurrency(cancellationDetails.total_price, cancellationDetails.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-['Nunito'] text-xs text-[#6b7280]">
                                                Refund ({cancellationDetails.refund_percentage}%):
                                            </span>
                                            <span className="font-['Nunito'] text-xs font-semibold text-[#166534]">
                                                {formatCurrency(cancellationDetails.refund_amount, cancellationDetails.currency)}
                                            </span>
                                        </div>
                                        {cancellationDetails.cancellation_fee > 0 && (
                                            <div className="flex justify-between">
                                                <span className="font-['Nunito'] text-xs text-[#6b7280]">
                                                    Cancellation Fee:
                                                </span>
                                                <span className="font-['Nunito'] text-xs text-[#dc2626]">
                                                    {formatCurrency(cancellationDetails.cancellation_fee, cancellationDetails.currency)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Policy Notice */}
                            {policyMessage && (
                                <div
                                    className={`rounded-xl p-3 mb-4 flex items-start gap-2 ${
                                        policyMessage.type === 'success'
                                            ? 'bg-[#f0fdf4] border border-[#bbf7d0]'
                                            : policyMessage.type === 'warning'
                                              ? 'bg-[#fff9e9] border border-[#fde68a]'
                                              : policyMessage.type === 'error'
                                                ? 'bg-[#fef2f2] border border-[#fecaca]'
                                                : 'bg-[#f0f9ff] border border-[#bae6fd]'
                                    }`}
                                >
                                    <Icon
                                        icon="mdi:information-outline"
                                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                                            policyMessage.type === 'success'
                                                ? 'text-[#166534]'
                                                : policyMessage.type === 'warning'
                                                  ? 'text-[#d97706]'
                                                  : policyMessage.type === 'error'
                                                    ? 'text-[#dc2626]'
                                                    : 'text-[#0284c7]'
                                        }`}
                                    />
                                    <p
                                        className={`font-['Nunito'] text-xs text-left ${
                                            policyMessage.type === 'success'
                                                ? 'text-[#166534]'
                                                : policyMessage.type === 'warning'
                                                  ? 'text-[#92400e]'
                                                  : policyMessage.type === 'error'
                                                    ? 'text-[#991b1b]'
                                                    : 'text-[#075985]'
                                        }`}
                                    >
                                        {policyMessage.message}
                                    </p>
                                </div>
                            )}

                            {/* Recurring Booking Option */}
                            {cancellationDetails?.is_recurring && cancellationDetails.child_bookings_count > 0 && (
                                <div className="bg-[#f9fafb] rounded-xl p-3 mb-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={cancelSeries}
                                            onChange={(e) => setCancelSeries(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#338078] focus:ring-[#338078]"
                                        />
                                        <span className="font-['Nunito'] text-xs text-[#374151] text-left">
                                            Also cancel {cancellationDetails.child_bookings_count} upcoming session
                                            {cancellationDetails.child_bookings_count > 1 ? 's' : ''} in this series
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Reason Input */}
                            <div className="mb-4">
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Reason for cancellation (optional)"
                                    className="w-full rounded-xl border border-[#e5e7eb] p-3 font-['Nunito'] text-sm text-[#181818] placeholder:text-[#9ca3af] focus:border-[#338078] focus:ring-1 focus:ring-[#338078] resize-none"
                                    rows={2}
                                    maxLength={500}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isLoading}
                                    className="flex-1 rounded-[56px] border-[#e5e7eb] text-[#374151]  font-['Nunito'] font-semibold text-sm h-11 cursor-pointer"
                                >
                                    Keep Booking
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className="flex-1 rounded-[56px] bg-[#dc2626] hover:bg-[#b91c1c] text-white font-['Nunito'] font-semibold text-sm h-11 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                                            Cancelling...
                                        </span>
                                    ) : (
                                        'Yes, Cancel'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
