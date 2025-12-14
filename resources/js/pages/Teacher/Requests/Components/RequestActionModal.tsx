import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface RequestActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    type: 'accept' | 'decline';
    isProcessing?: boolean;
}

export const RequestActionModal: React.FC<RequestActionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    type,
    isProcessing = false
}) => {
    const isAccept = type === 'accept';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center p-8 text-center sm:rounded-[32px]">

                {/* Icon Composition */}
                <div className="relative mb-6">
                    {/* Base Icon (Sheet/List) - Purpleish */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#EBE9FE] text-[#7F56D9]">
                        <Icon icon="heroicons:document-text" className="h-10 w-10 text-[#CBB5F8]" />
                    </div>

                    {/* Badge Icon (Check or Alert) */}
                    <div className={cn(
                        "absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white",
                        isAccept ? "bg-[#47B881]" : "bg-[#F04438]"
                    )}>
                        <Icon
                            icon={isAccept ? "heroicons:check" : "heroicons:exclamation-circle"}
                            className="h-5 w-5 text-white"
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="mb-8 text-xl font-semibold text-gray-900 px-4">
                    Are you sure you want to {isAccept ? 'accept' : 'decline'} this request?
                </h2>

                {/* Buttons */}
                <div className="flex w-full items-center justify-center gap-4">
                    <Button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={cn(
                            "min-w-[140px] rounded-full px-6 py-6 text-base font-medium shadow-none hover:shadow-md transition-all",
                            isAccept
                                ? "bg-[#388E7B] hover:bg-[#2F7A6A] text-white"
                                : "bg-[#388E7B] hover:bg-[#2F7A6A] text-white" // User requested specific UI, keeping similar style or Red? 
                            // Figma usually implies specific colors. Let's stick to the Teal requesting style or Red for decline?
                            // User said: "Yes, Decline" button. Looking at images, both buttons look Teal/Green in my mind's eye default, 
                            // but for Decline it usually implies danger. 
                            // Wait, the decline image snippet has a Red badge. The button color isn't explicitly RED in common "IqraQuest" branding unless specified.
                            // However, for safety, I will use the Branding Teal for Accept and Red for Decline?
                            // Re-reading prompt: "The 'Decline' state... 'Yes, Decline' button." 
                            // Looking at the uploaded image filenames `uploaded_image_1_1765705575623.png` (Decline).
                            // I will assume standard Teal for Accept. 
                            // Let's check the user's styling. Usually, primary actions are branded.
                            // I will use the brand color for both but maybe Red for decline if needed. 
                            // Let's stick to the implementation:
                            // Accept -> Brand Teal (#388E7B)
                            // Decline -> Brand Teal (#388E7B) based on "IqraQuest" usually having unified buttons, 
                            // UNLESS standard UX patterns apply.
                            // Let's use #388E7B for both as per consistent UI, unless "Decline" implies destructive. 
                            // Actually, typical Tailwind/Shadcn would be `variant="destructive"`.
                            // I'll use custom hexes to match the "Green" button seen in previous screenshots for "Book Now".
                        )}
                    >
                        {isProcessing ? (
                            <Icon icon="eos-icons:loading" className="mr-2 h-5 w-5 animate-spin" />
                        ) : null}
                        Yes, {isAccept ? 'Accept' : 'Decline'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="min-w-[140px] rounded-full border-gray-300 px-6 py-6 text-base font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
