import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Payout } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Assuming exists, otherwise standard textarea

interface Props {
    isOpen: boolean;
    onClose: () => void;
    payout: Payout | null;
    onConfirm: (reason: string) => void;
}

export default function RejectPayoutModal({ isOpen, onClose, payout, onConfirm }: Props) {
    const [reason, setReason] = useState('');

    if (!payout) return null;

    const handleConfirm = () => {
        onConfirm(reason);
        setReason(''); // Reset
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-full bg-white rounded-[20px] p-8">
                <DialogHeader className="flex flex-col items-center gap-4">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full border border-[#FFD9D9] bg-white flex items-center justify-center">
                        <Icon icon="mdi:exclamation-thick" className="w-8 h-8 text-[#FF4D4D]" />
                    </div>

                    {/* Title */}
                    <DialogTitle className="text-center text-xl text-[#334155] font-medium leading-relaxed">
                        Are you sure you want to reject this withdrawal request for <span className="font-bold">₦{Number(payout.amount).toLocaleString()}</span>?
                    </DialogTitle>
                </DialogHeader>

                {/* Details */}
                <div className="space-y-4 my-6">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[#334155] text-sm font-medium">Teacher:</span>
                        <div className="bg-[#FFF9EA] px-4 py-2 rounded-full text-[#475569] font-medium text-sm">
                            {payout.teacher.user.name}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[#334155] text-sm font-medium">Payment Method:</span>
                        <div className="bg-[#FFF9EA] px-4 py-2 rounded-full text-[#475569] font-medium text-sm text-center">
                            {payout.payment_method
                                ? `${payout.payment_method.payment_type === 'bank_transfer' ? 'Bank Transfer' : 'PayPal'} – ${payout.payment_method.bank_name ? payout.payment_method.bank_name + ': ' : ''}${payout.payment_method.account_number || payout.payment_method.email}`
                                : 'No method details'
                            }
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div className="w-full">
                        <label className="block text-[#192020] font-medium mb-2">Admin Note (Optional)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Your account details appear invalid. Please update your payout method."
                            className="w-full h-24 rounded-xl border border-gray-200 p-4 bg-gray-50 focus:bg-white focus:border-[#2D7A70] focus:ring-1 focus:ring-[#2D7A70] outline-none text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <DialogFooter className="flex flex-col text-center w-full gap-2"> {/* using flex-col for mobile-first button stacking as per some designs, wait check design, it says btns side by side but usually mobile stack */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-center w-full">
                        <button
                            onClick={handleConfirm}
                            className="w-full sm:w-[160px] h-12 rounded-full bg-[#338078] text-white font-medium hover:bg-[#25665d] transition-colors"
                        >
                            Yes, I'm sure
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-[160px] h-12 rounded-full border border-[#338078] text-[#338078] font-medium hover:bg-gray-50 transition-colors"
                        >
                            No, cancel
                        </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
