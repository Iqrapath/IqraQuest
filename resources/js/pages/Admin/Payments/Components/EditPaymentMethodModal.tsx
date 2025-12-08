import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { Payout } from '@/types';
import { toast } from "sonner";
import { Icon } from '@iconify/react';
import axios from 'axios';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    payout: Payout | null;
}

interface Bank {
    name: string;
    code: string;
    slug: string;
}

export default function EditPaymentMethodModal({ isOpen, onClose, payout }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        payment_type: 'bank_transfer',
        bank_name: '',
        account_number: '',
        account_name: '',
        bank_code: '',
        email: '',
    });

    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // Fetch banks on mount
    useEffect(() => {
        if (isOpen && banks.length === 0) {
            setIsLoadingBanks(true);
            axios.get('/admin/payouts/banks')
                .then(res => {
                    // Normalize data: sometimes payload is wrapped in data, sometimes array directly if adapted poorly
                    // Our PHP controller returns response()->json($banks['data']) so it should be array directly or {data: []} from axios
                    const bankList = Array.isArray(res.data) ? res.data : [];
                    setBanks(bankList);
                })
                .catch(err => {
                    console.error('Error loading banks:', err);
                    toast.error('Failed to load bank list');
                })
                .finally(() => setIsLoadingBanks(false));
        }
    }, [isOpen]);

    // Populate form when payout opens
    useEffect(() => {
        if (payout && payout.payment_method) {
            setData({
                payment_type: payout.payment_method.payment_type || 'bank_transfer',
                bank_name: payout.payment_method.bank_name || '',
                account_number: payout.payment_method.account_number || '',
                account_name: payout.payment_method.account_name || '',
                bank_code: payout.payment_method.bank_code || '',
                email: payout.payment_method.email || '',
            });
            // Assume existing data is verified if it exists
            if (payout.payment_method.payment_type === 'bank_transfer') {
                setIsVerified(!!payout.payment_method.account_name);
            } else {
                setIsVerified(true);
            }
        }
    }, [payout, isOpen]);

    // Auto-verify account
    useEffect(() => {
        if (data.payment_type === 'bank_transfer' && data.account_number.length === 10 && data.bank_code) {
            // Debounce could be added here, but simple effect is fine for now
            verifyAccount();
        } else if (data.payment_type === 'bank_transfer') {
            // If they change number to invalid length, invalid
            if (isVerified) setIsVerified(false);
        }
    }, [data.account_number, data.bank_code]);

    const verifyAccount = async () => {
        setIsVerifying(true);
        try {
            const response = await axios.get(`/admin/payouts/resolve-account?account_number=${data.account_number}&bank_code=${data.bank_code}`);

            if (response.data.account_name) {
                setData('account_name', response.data.account_name);
                setIsVerified(true);
                toast.success('Account verified: ' + response.data.account_name);
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            setIsVerified(false);
            // Only clear name if it wasn't valid, but let's keep it clean
            setData('account_name', '');
            toast.error(error.response?.data?.error || 'Could not verify account');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleBankChange = (code: string) => {
        const bank = banks.find(b => b.code === code);
        setData(data => ({
            ...data,
            bank_code: code,
            bank_name: bank ? bank.name : ''
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!payout) return;

        if (data.payment_type === 'bank_transfer' && !isVerified) {
            toast.error('Please wait for account verification.');
            return;
        }

        post(`/admin/payouts/${payout.id}/update-method`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment method updated successfully');
                onClose();
            },
            onError: (err) => {
                console.error('Update Error:', err);
                toast.error('Failed to update payment method');
            }
        });
    };

    if (!payout) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-full bg-white rounded-[20px] p-8 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl text-[#192020] font-bold">Edit Payment Method</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Payment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                        <select
                            value={data.payment_type}
                            onChange={(e) => setData('payment_type', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:border-[#2D7A70] outline-none"
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="paypal">PayPal</option>
                        </select>
                        {errors.payment_type && <p className="text-red-500 text-xs mt-1">{errors.payment_type}</p>}
                    </div>

                    {data.payment_type === 'bank_transfer' ? (
                        <>
                            {/* Bank Code (Combobox) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <Combobox
                                    options={banks.map(bank => ({ value: bank.code, label: bank.name }))}
                                    value={data.bank_code}
                                    onChange={handleBankChange}
                                    placeholder={isLoadingBanks ? "Loading banks..." : "Select bank"}
                                    searchPlaceholder="Search bank..."
                                    className="w-full"
                                />
                                {errors.bank_code && <p className="text-red-500 text-xs mt-1">{errors.bank_code}</p>}
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.account_number}
                                        onChange={(e) => {
                                            // Only digits and max 10 chars
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setData('account_number', val);
                                        }}
                                        className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:border-[#2D7A70] outline-none"
                                        placeholder="e.g. 0123456789"
                                    />
                                    {isVerifying && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Icon icon="line-md:loading-loop" className="w-5 h-5 text-[#2D7A70]" />
                                        </div>
                                    )}
                                </div>
                                {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>}
                            </div>

                            {/* Account Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input
                                    type="text"
                                    value={data.account_name}
                                    readOnly
                                    className={`w-full rounded-xl border border-gray-200 p-3 outline-none ${data.account_name ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'}`}
                                    placeholder="Auto-verified name"
                                />
                                {errors.account_name && <p className="text-red-500 text-xs mt-1">{errors.account_name}</p>}
                            </div>
                        </>
                    ) : (
                        /* PayPal Email */
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:border-[#2D7A70] outline-none"
                                placeholder="name@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-3 sm:justify-end w-full mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 h-12 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || (data.payment_type === 'bank_transfer' && !isVerified)}
                            className={`w-full sm:w-auto px-6 h-12 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isVerified || data.payment_type === 'paypal'
                                    ? 'bg-[#2D7A70] text-white hover:bg-[#25665d]'
                                    : 'bg-gray-300 text-gray-500'
                                }`}
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
