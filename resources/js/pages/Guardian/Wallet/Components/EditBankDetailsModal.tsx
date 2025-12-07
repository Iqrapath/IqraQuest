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

interface EditBankDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bankDetails: {
        id: number;
        bank_name: string;
        bank_code: string;
        bank_account_number: string;
        bank_account_name: string;
    } | null;
}

interface Bank {
    name: string;
    code: string;
    slug: string;
}

export const EditBankDetailsModal: React.FC<EditBankDetailsModalProps> = ({
    isOpen,
    onClose,
    bankDetails,
}) => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    const [accountNumber, setAccountNumber] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [accountName, setAccountName] = useState('');

    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch banks on mount
    useEffect(() => {
        if (isOpen && banks.length === 0) {
            setIsLoadingBanks(true);
            fetch('/guardian/payment/banks')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setBanks(data);
                    } else {
                        console.error('Failed to load banks - not an array', data);
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

    // Set initial values when bankDetails changes AND banks are loaded
    useEffect(() => {
        if (bankDetails && banks.length > 0) {
            setAccountNumber(bankDetails.bank_account_number);
            setSelectedBank(bankDetails.bank_code);
            setAccountName(bankDetails.bank_account_name);
            setIsVerified(true);
            setVerificationError('');
        }
    }, [bankDetails, banks]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setAccountNumber('');
            setSelectedBank('');
            setAccountName('');
            setIsVerified(false);
            setVerificationError('');
        }
    }, [isOpen]);

    // Verify account when number (10 digits) and bank are present
    useEffect(() => {
        if (accountNumber.length === 10 && selectedBank && accountNumber !== bankDetails?.bank_account_number) {
            verifyAccount();
        } else if (accountNumber === bankDetails?.bank_account_number && selectedBank === bankDetails?.bank_code) {
            setAccountName(bankDetails.bank_account_name);
            setIsVerified(true);
            setVerificationError('');
        } else if (accountNumber.length !== 10) {
            if (accountNumber !== bankDetails?.bank_account_number) {
                setAccountName('');
                setIsVerified(false);
                setVerificationError('');
            }
        }
    }, [accountNumber, selectedBank]);

    const verifyAccount = async () => {
        setIsVerifying(true);
        setVerificationError('');
        setAccountName('');
        setIsVerified(false);

        try {
            const response = await fetch(`/guardian/payment/resolve-account?account_number=${accountNumber}&bank_code=${selectedBank}`);
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
        if (!isVerified || !selectedBank || !bankDetails) return;

        setIsSaving(true);

        try {
            const selectedBankObj = banks.find(b => b.code === selectedBank);

            const response = await fetch(`/guardian/payment/methods/bank/${bankDetails.id}`, {
                method: 'PUT',
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
                toast.success('Bank details updated successfully!');
                onClose();
                window.location.reload();
            } else {
                toast.error(data.message || 'Failed to update bank details');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('An error occurred while updating.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] p-0 gap-0 bg-white border-none shadow-xl overflow-hidden rounded-[26px]">
                <VisuallyHidden>
                    <DialogTitle>Edit Bank Details</DialogTitle>
                    <DialogDescription>Update your bank account information for withdrawals.</DialogDescription>
                </VisuallyHidden>

                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#111928] font-['Nunito']">
                            Edit Bank Details
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                        </button>
                    </div>

                    {isLoadingBanks ? (
                        <div className="space-y-6 animate-pulse">
                            {/* Account Name Skeleton */}
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-14 bg-gray-100 rounded-xl"></div>
                            </div>

                            {/* Bank Name Skeleton */}
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-12 bg-gray-100 rounded-xl"></div>
                            </div>

                            {/* Account Number Skeleton */}
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-28"></div>
                                <div className="h-12 bg-gray-100 rounded-xl"></div>
                                <div className="h-3 bg-gray-100 rounded w-full"></div>
                            </div>

                            {/* Button Skeleton */}
                            <div className="h-12 bg-gray-200 rounded-full w-40"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Account Name (ReadOnly) */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700">Account Name</label>
                                    <span className="text-sm text-gray-500 font-medium">Edit</span>
                                </div>
                                <div className={`w-full p-4 rounded-xl border ${accountName ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                    {isVerifying ? (
                                        <div className="flex items-center gap-2">
                                            <Icon icon="line-md:loading-loop" className="w-4 h-4" />
                                            <span>Verifying account...</span>
                                        </div>
                                    ) : (
                                        accountName || "Enter Account Number"
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

                            {/* Save Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!isVerified || isVerifying || isSaving}
                                className={`mt-4 px-8 py-3 rounded-full font-medium text-white transition-all ${isVerified && !isSaving
                                    ? 'bg-[#2D7A70] hover:bg-[#24635b] shadow-lg shadow-[#2D7A70]/20'
                                    : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
