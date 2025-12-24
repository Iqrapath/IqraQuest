import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';

type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    isLoading?: boolean;
}

const variantConfig: Record<ModalVariant, { icon: string; iconColor: string; buttonClass: string }> = {
    danger: {
        icon: 'mdi:alert-circle',
        iconColor: 'text-red-500',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
        icon: 'mdi:alert',
        iconColor: 'text-yellow-500',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    info: {
        icon: 'mdi:information',
        iconColor: 'text-blue-500',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    success: {
        icon: 'mdi:check-circle',
        iconColor: 'text-green-500',
        buttonClass: 'bg-[#338078] hover:bg-[#2a6b64] text-white',
    },
};

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    isLoading = false,
}: ConfirmationModalProps) {
    const config = variantConfig[variant];

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 ${config.iconColor}`}>
                            <Icon icon={config.icon} className="w-6 h-6" />
                        </div>
                        <DialogTitle className="font-['Nunito'] text-[18px] font-semibold text-gray-900">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="font-['Nunito'] text-[14px] text-gray-600 mt-2 pl-9">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="font-['Nunito']"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`font-['Nunito'] ${config.buttonClass}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
