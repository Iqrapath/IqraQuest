import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import axios from 'axios';

interface EditPayPalModalProps {
    isOpen: boolean;
    onClose: () => void;
    paypalDetails: {
        id: number;
        paypal_email: string;
    } | null;
}

const EditPayPalModal: React.FC<EditPayPalModalProps> = ({ isOpen, onClose, paypalDetails }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (paypalDetails) {
            setEmail(paypalDetails.paypal_email);
        }
    }, [paypalDetails]);

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
        } else if (paypalDetails) {
            setEmail(paypalDetails.paypal_email);
        }
    }, [isOpen, paypalDetails]);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/guardian/payment/methods/paypal/initiate');

            if (response.data.url) {
                toast.success('Redirecting to PayPal...');
                window.location.href = response.data.url;
            } else {
                toast.error('Failed to initiate PayPal connection');
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate update');
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[500px] p-0 gap-0 bg-white border-none shadow-xl overflow-hidden rounded-[26px]">
                <VisuallyHidden>
                    <DialogTitle>Update PayPal</DialogTitle>
                    <DialogDescription>Update the connected PayPal account.</DialogDescription>
                </VisuallyHidden>

                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#111928] font-['Nunito'] flex items-center gap-2">
                            <Icon icon="logos:paypal" className="w-6 h-6" />
                            Update PayPal Account
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Current Connected Account</span>
                                <span className="text-lg font-medium text-gray-900">{paypalDetails?.paypal_email || 'Loading...'}</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm">
                            To update your PayPal account, you will be redirected to PayPal to verify and connect a new account.
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <button
                                onClick={handleUpdate}
                                disabled={isLoading}
                                className="bg-[#0070BA] hover:bg-[#003087] text-white px-8 py-3 rounded-full font-medium text-sm transition-colors disabled:opacity-70 shadow-lg shadow-blue-500/20 flex-1 flex items-center justify-center gap-2"
                            >
                                <Icon icon="logos:paypal" className="w-4 h-4 brightness-0 invert" />
                                {isLoading ? 'Redirecting...' : 'Connect Different Account'}
                            </button>

                            <button
                                onClick={onClose}
                                className="text-gray-500 font-medium text-sm hover:text-gray-700 px-6"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditPayPalModal;
