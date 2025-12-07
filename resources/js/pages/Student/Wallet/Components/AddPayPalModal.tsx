import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

interface AddPayPalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddPayPalModal: React.FC<AddPayPalModalProps> = ({ isOpen, onClose }) => {
    const { auth } = usePage<any>().props;
    const [isLoading, setIsLoading] = useState(false);

    const handlePayPalTransfer = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/student/payment/methods/paypal/initiate');

            if (response.data.url) {
                toast.success('Redirecting to PayPal...');
                window.location.href = response.data.url;
            } else {
                toast.error('Failed to initiate PayPal connection');
                setIsLoading(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to connect PayPal');
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-6 bg-white border-none shadow-xl rounded-[24px]">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Icon icon="logos:paypal" className="w-6 h-6" />
                        </div>
                        Connect PayPal
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <p className="text-gray-600 text-[15px] leading-relaxed font-light">
                        In order to complete your PayPal registration, we will transfer you over to PayPal's secure servers.
                    </p>

                    <div className="flex items-center gap-6 pt-2">
                        <button
                            onClick={handlePayPalTransfer}
                            disabled={isLoading}
                            className="bg-[#2D7A70] hover:bg-[#24635b] text-white px-8 py-2.5 rounded-full font-medium text-sm transition-colors disabled:opacity-70 shadow-lg shadow-[#2D7A70]/20"
                        >
                            {isLoading ? 'Processing...' : 'Ok Transfer Me'}
                        </button>

                        <button
                            onClick={onClose}
                            className="text-[#2D7A70] font-medium text-sm hover:underline"
                        >
                            No Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddPayPalModal;
