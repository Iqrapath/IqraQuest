
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

interface AddBankDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Bank {
    name: string;
    code: string;
    slug: string;
}

export const AddBankDetailsModal: React.FC<AddBankDetailsModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    const [accountNumber, setAccountNumber] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [accountName, setAccountName] = useState('');

    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    // Fetch banks on mount
    useEffect(() => {
        if (isOpen && banks.length === 0) {
            setIsLoadingBanks(true);
            fetch('/teacher/payment/banks')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setBanks(data);
                    } else {
                        console.error('Failed to load banks', data);
                        toast.error('Failed to load bank list');
                    }
                })
                .catch(err => {
                    console.error('Error loading banks:', err);
                    toast.error('Error loading bank list');
                })
                .finally(() => setIsLoadingBanks(false));
        }
    }, [isOpen]);

    // Verify account when number (10 digits) and bank are present
    useEffect(() => {
        if (accountNumber.length === 10 && selectedBank) {
            verifyAccount();
        } else {
            setAccountName('');
            setIsVerified(false);
            setVerificationError('');
        }
    }, [accountNumber, selectedBank]);

    const verifyAccount = async () => {
        setIsVerifying(true);
        setVerificationError('');
        setAccountName('');
        setIsVerified(false);

        try {
            const response = await fetch(`/teacher/payment/resolve-account?account_number=${accountNumber}&bank_code=${selectedBank}`);
            const data = await response.json();

            if (response.ok && data.account_name) {
                setAccountName(data.account_name);
                setIsVerified(true);
                toast.success('Account verified successfully');
            } else {
                setVerificationError(data.error || 'Could not verify account details');
                toast.error(data.error || 'Could not verify account details');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setVerificationError('Network error verifying account');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async () => {
        if (!isVerified || !selectedBank) return;

        setIsVerifying(true);

        try {
            const selectedBankObj = banks.find(b => b.code === selectedBank);

            const response = await fetch('/teacher/payment/methods/bank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                },
                body: JSON.stringify({
                    account_number: accountNumber,
                    bank_code: selectedBank,
                    bank_name: selectedBankObj?.name || 'Unknown Bank'
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Bank details saved successfully!');
                onClose();
                window.location.reload();
            } else {
                toast.error(data.message || 'Failed to save bank details');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('An error occurred while saving.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] p-0 gap-0 bg-white border-none shadow-xl overflow-hidden rounded-[26px]">
                <VisuallyHidden>
                    <DialogTitle>Add your Bank Details</DialogTitle>
                    <DialogDescription>Easily transfer your Earning balance to your bank account.</DialogDescription>
                </VisuallyHidden>

                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#111928] font-['Nunito']">
                            Add your Bank Details
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="text-gray-500 mb-8 font-light">
                        Easily transfer your Earning balance to your bank account
                    </p>

                    {isLoadingBanks ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Icon icon="line-md:loading-loop" className="w-10 h-10 text-[#2D7A70]" />
                            <p className="text-gray-500">Loading bank list...</p>
                        </div>
                    ) : banks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                                <Icon icon="solar:danger-circle-bold" className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-gray-900 font-medium">Failed to load banks</p>
                                <p className="text-sm text-gray-500 mt-1">Please check your internet connection and try again</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsLoadingBanks(true);
                                    fetch('/teacher/payment/banks')
                                        .then(res => res.json())
                                        .then(data => {
                                            if (Array.isArray(data)) {
                                                setBanks(data);
                                            } else {
                                                toast.error('Failed to load bank list');
                                            }
                                        })
                                        .catch(() => toast.error('Error loading bank list'))
                                        .finally(() => setIsLoadingBanks(false));
                                }}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Account Name (ReadOnly) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Account Name</label>
                                <div className={`w-full p-4 rounded-xl border ${accountName ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                    {isVerifying ? (
                                        <div className="flex items-center gap-2">
                                            <Icon icon="line-md:loading-loop" className="w-4 h-4" />
                                            <span>Verifying account...</span>
                                        </div>
                                    ) : (
                                        accountName || "Enter Account Name"
                                    )}
                                </div>
                                {verificationError && (
                                    <p className="text-xs text-red-500">{verificationError}</p>
                                )}
                            </div>

                            {/* Bank Name (Combobox) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                                <Combobox
                                    options={banks.map(bank => ({ value: bank.code, label: bank.name }))}
                                    value={selectedBank}
                                    onChange={setSelectedBank}
                                    placeholder="Select bank"
                                    searchPlaceholder="Search bank..."
                                    className="w-full justify-between"
                                />
                            </div>

                            {/* Account Number */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Account Number</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                        #
                                    </div>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setAccountNumber(val);
                                        }}
                                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-[#2D7A70] focus:ring-1 focus:ring-[#2D7A70] outline-none transition-all"
                                        placeholder="Enter Account Number"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">
                                    Please enter valid account number with the right number of digits.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!isVerified || isVerifying}
                                className={`mt-4 px-8 py-3 rounded-full font-medium text-white transition-all ${isVerified
                                    ? 'bg-[#2D7A70] hover:bg-[#24635b] shadow-lg shadow-[#2D7A70]/20'
                                    : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                Add Your Bank
                            </button>

                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
