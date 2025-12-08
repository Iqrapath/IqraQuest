import { Icon } from '@iconify/react';
import { Payout } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    payout: Payout | null;
    onConfirm: () => void;
}

export default function ApprovePayoutModal({ isOpen, onClose, payout, onConfirm }: Props) {
    if (!payout) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-full bg-white rounded-[20px] p-8">
                <DialogHeader className="flex flex-col items-center gap-4">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-[#E8F8F5] flex items-center justify-center">
                        <Icon icon="mdi:help" className="w-8 h-8 text-[#2D7A70]" />
                    </div>

                    {/* Title */}
                    <DialogTitle className="text-center text-xl text-[#334155] font-medium leading-relaxed">
                        Are you sure you want to approve and send this withdrawal request for <span className="font-bold">₦{Number(payout.amount).toLocaleString()}</span>?
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
                </div>

                {/* Buttons */}
                <DialogFooter className="flex-col sm:flex-row gap-3 sm:justify-center w-full">
                    <button
                        onClick={onConfirm}
                        className="w-full sm:w-[160px] h-12 rounded-full bg-[#2D7A70] text-white font-medium hover:bg-[#25665d] transition-colors"
                    >
                        Approve & Send
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-[160px] h-12 rounded-full border border-[#2D7A70] text-[#2D7A70] font-medium hover:bg-gray-50 transition-colors"
                    >
                        No, cancel
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
