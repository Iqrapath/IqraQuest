import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { Icon } from '@iconify/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { toast } from 'sonner';

interface AddMobileWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WALLET_PROVIDERS = [
    { value: 'mtn', label: 'MTN Mobile Money' },
    { value: 'airtel', label: 'Airtel Money' },
    { value: 'glo', label: 'Glo Mobile Money' },
    { value: '9mobile', label: '9mobile Money' },
];

// Provider prefix mapping for Nigerian networks
const PROVIDER_PREFIXES: Record<string, string[]> = {
    mtn: ['0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916'],
    airtel: ['0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912'],
    glo: ['0805', '0807', '0811', '0815', '0905', '0915'],
    '9mobile': ['0809', '0817', '0818', '0908', '0909'],
};

export const AddMobileWalletModal: React.FC<AddMobileWalletModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [accountName, setAccountName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isValid, setIsValid] = useState(false);

    // Validate phone number
    const validatePhoneNumber = (phone: string, provider: string): string => {
        if (!phone) return '';

        // Remove any spaces or special characters except +
        const cleanPhone = phone.replace(/[\s-]/g, '');

        // Check for Nigerian format (11 digits starting with 0, or 10 digits without 0)
        const phonePattern = /^0\d{10}$/;
        const phonePatternWithout0 = /^\d{10}$/;
        const internationalPattern = /^\+234\d{10}$/;

        if (!phonePattern.test(cleanPhone) && !phonePatternWithout0.test(cleanPhone) && !internationalPattern.test(cleanPhone)) {
            return 'Please enter a valid Nigerian phone number (e.g., 08031234567)';
        }

        if (!provider) return '';

        // Extract first 4 digits for prefix check
        let prefix = '';
        if (cleanPhone.startsWith('+234')) {
            prefix = '0' + cleanPhone.substring(4, 7);
        } else if (cleanPhone.startsWith('0')) {
            prefix = cleanPhone.substring(0, 4);
        } else {
            prefix = '0' + cleanPhone.substring(0, 3);
        }

        // Check if prefix matches selected provider
        const validPrefixes = PROVIDER_PREFIXES[provider] || [];
        if (!validPrefixes.includes(prefix)) {
            const providerName = WALLET_PROVIDERS.find(p => p.value === provider)?.label || provider;
            return `This number doesn't match ${providerName}. Please check the provider or number.`;
        }

        return '';
    };

    // Validate on phone number or provider change
    useEffect(() => {
        const error = validatePhoneNumber(phoneNumber, selectedProvider);
        setValidationError(error);
        setIsValid(!error && !!phoneNumber && !!selectedProvider);
    }, [phoneNumber, selectedProvider]);

    const handleSubmit = async () => {
        if (!isValid || !accountName) {
            toast.error('Please fill all fields correctly');
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/teacher/payment/methods/mobile-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    wallet_provider: selectedProvider,
                    account_name: accountName
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Mobile wallet added successfully!');
                onClose();
                window.location.reload();
            } else {
                toast.error(data.message || 'Failed to add mobile wallet');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPhoneNumber('');
            setSelectedProvider('');
            setAccountName('');
            setValidationError('');
            setIsValid(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] p-0 gap-0 bg-white border-none shadow-xl overflow-hidden rounded-[26px]">
                <VisuallyHidden>
                    <DialogTitle>Add Mobile Wallet</DialogTitle>
                    <DialogDescription>Add your mobile money wallet for payments.</DialogDescription>
                </VisuallyHidden>

                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#111928] font-['Nunito']">
                            Add Mobile Wallet
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Account Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Name</label>
                            <input
                                type="text"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-[#2D7A70] focus:ring-1 focus:ring-[#2D7A70] outline-none transition-all"
                                placeholder="Enter your name"
                            />
                        </div>

                        {/* Wallet Provider */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Wallet Provider</label>
                            <Combobox
                                options={WALLET_PROVIDERS}
                                value={selectedProvider}
                                onChange={setSelectedProvider}
                                placeholder="Select provider"
                                searchPlaceholder="Search provider..."
                                className="w-full justify-between"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                    <Icon icon="solar:phone-bold" className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9+]/g, '');
                                        setPhoneNumber(val);
                                    }}
                                    className={`w-full h-12 pl-12 pr-4 rounded-xl border ${validationError && phoneNumber
                                            ? 'border-red-300 bg-red-50/50'
                                            : isValid
                                                ? 'border-green-300 bg-green-50/50'
                                                : 'border-gray-200 bg-gray-50/50'
                                        } focus:border-[#2D7A70] focus:ring-1 focus:ring-[#2D7A70] outline-none transition-all`}
                                    placeholder="08031234567"
                                />
                            </div>
                            {validationError && phoneNumber ? (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
                                    {validationError}
                                </p>
                            ) : isValid ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                                    Phone number verified
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400">
                                    Enter your mobile money number (e.g., 08031234567)
                                </p>
                            )}
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid || !accountName || isSaving}
                            className={`mt-4 px-8 py-3 rounded-full font-medium text-white transition-all ${isValid && accountName && !isSaving
                                    ? 'bg-[#2D7A70] hover:bg-[#24635b] shadow-lg shadow-[#2D7A70]/20'
                                    : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            {isSaving ? 'Saving...' : 'Add Mobile Wallet'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
