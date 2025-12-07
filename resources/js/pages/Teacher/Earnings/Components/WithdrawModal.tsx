import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useCurrency, CURRENCY_CONFIG, CurrencyCode } from '@/contexts/CurrencyContext';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    paymentMethods: any[]; // We will find the default/verified bank from here
}

export function WithdrawModal({ isOpen, onClose, availableBalance, paymentMethods }: WithdrawModalProps) {
    const { currency, config } = useCurrency();
    const [isSelecting, setIsSelecting] = React.useState(false);

    // Filter only verified methods
    const verifiedMethods = paymentMethods.filter(m => m.is_verified);

    // Default to first verified bank (or any verified)
    const [selectedMethod, setSelectedMethod] = React.useState<any>(null);

    React.useEffect(() => {
        if (isOpen && !selectedMethod) {
            const defaultMethod = verifiedMethods.find(m => m.type === 'bank_account') || verifiedMethods[0];
            setSelectedMethod(defaultMethod);
        }
    }, [isOpen, verifiedMethods, selectedMethod]);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method_id: '',
    });

    // Update form when selection changes
    React.useEffect(() => {
        if (selectedMethod) {
            setData('payment_method_id', selectedMethod.id);
        }
    }, [selectedMethod]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMethod) {
            toast.error('Please select a payment method.');
            return;
        }

        post('/teacher/payouts', {
            onSuccess: () => {
                toast.success('Withdrawal request submitted successfully');
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Failed to submit withdrawal request');
            }
        });
    };

    if (!isOpen) return null;

    // Minimums: $10 or ₦5,000
    const minAmount = currency === 'USD' ? 10 : 5000;
    const minAmountText = `$10 / ₦5,000`;

    // Render helper for method details
    const renderMethodDetails = (method: any) => {
        if (!method) return null;

        if (method.type === 'bank_account') {
            return (
                <div>
                    <p className="text-[#192020] font-medium text-lg">{method.bank_name || 'Bank Transfer'}</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {method.bank_account_name} | <span className="tracking-wider">{method.bank_account_number}</span>
                    </p>
                </div>
            );
        } else if (method.type === 'mobile_wallet') {
            return (
                <div>
                    <p className="text-[#192020] font-medium text-lg">{method.wallet_provider || 'Mobile Wallet'}</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {method.wallet_account_name} | <span className="tracking-wider">{method.wallet_phone_number}</span>
                    </p>
                </div>
            );
        } else if (method.type === 'paypal') {
            return (
                <div>
                    <p className="text-[#192020] font-medium text-lg">PayPal</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {method.paypal_email}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[20px] w-full max-w-xl p-8 relative overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto hide-scrollbar">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <Icon icon="mdi:close" className="w-6 h-6" />
                </button>

                {isSelecting ? (
                    /* SELECTION VIEW */
                    <div className="animate-in slide-in-from-right-10 duration-200">
                        <div className="flex items-center gap-2 mb-6 cursor-pointer group" onClick={() => setIsSelecting(false)}>
                            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            <h2 className="text-xl font-bold text-[#192020]">Select Payment Method</h2>
                        </div>

                        <div className="space-y-3">
                            {verifiedMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => {
                                        setSelectedMethod(method);
                                        setIsSelecting(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${selectedMethod?.id === method.id
                                            ? 'border-[#2D7A70] bg-[#E9FFFD]'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedMethod?.id === method.id ? 'bg-[#2D7A70] text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <Icon icon={
                                            method.type === 'paypal' ? 'logos:paypal' :
                                                method.type === 'mobile_wallet' ? 'mdi:cellphone' :
                                                    'mdi:bank'
                                        } className={method.type === 'paypal' ? '' : 'w-5 h-5'} />
                                    </div>
                                    <div>
                                        {renderMethodDetails(method)}
                                    </div>
                                    {selectedMethod?.id === method.id && (
                                        <div className="ml-auto text-[#2D7A70]">
                                            <Icon icon="mdi:check-circle" className="w-6 h-6" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {verifiedMethods.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No verified payment methods found.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* MAIN VIEW */
                    <div className="animate-in slide-in-from-left-10 duration-200">
                        <h2 className="text-2xl font-bold text-[#192020] mb-1">Withdraw your Earnings</h2>
                        <p className="text-gray-500 mb-8">Easily transfer your Earning balance to your bank account or wallet</p>

                        {/* Selected Method Section */}
                        {selectedMethod ? (
                            <div className="mb-8 group">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-[#00C48C] flex items-center justify-center text-white text-[10px]">
                                        <Icon icon="mdi:check-bold" />
                                    </div>
                                    <span className="font-bold text-[#192020] text-lg">
                                        {selectedMethod.type === 'bank_account' ? 'Bank Transfer' :
                                            selectedMethod.type === 'mobile_wallet' ? 'Mobile Wallet' : 'PayPal'}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between pl-7 p-3 rounded-lg hover:bg-gray-50 transition-colors -ml-3">
                                    {renderMethodDetails(selectedMethod)}
                                    <button
                                        onClick={() => setIsSelecting(true)}
                                        className="text-[#2D7A70] text-sm font-medium hover:underline pt-1 whitespace-nowrap ml-4"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Icon icon="mdi:alert-circle-outline" className="w-6 h-6" />
                                    <div>
                                        <p className="font-bold">No Verified Method</p>
                                        <p className="text-sm">Please select or add a method.</p>
                                    </div>
                                </div>
                                {verifiedMethods.length > 0 && (
                                    <button onClick={() => setIsSelecting(true)} className="text-sm font-bold underline">
                                        Select
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Amount Input Section */}
                        <div className="bg-[#E9FFFD] rounded-[20px] p-8">
                            <p className="text-[#525252] mb-4 text-center">Please input the amount you wish to withdraw from your wallet.</p>

                            <div className="flex items-center gap-4 mb-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="text-gray-900 font-bold text-lg">{config.symbol}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full h-[56px] pl-10 pr-6 rounded-full border-gray-200 focus:border-[#2D7A70] focus:ring-[#2D7A70] text-lg font-medium shadow-sm transition-all"
                                        placeholder="Amount"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={processing || !data.amount || !selectedMethod}
                                    className="h-[56px] px-8 bg-[#2D7A70] hover:bg-[#24635b] text-white font-bold rounded-full shadow-lg shadow-[#2D7A70]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                >
                                    {processing ? 'Processing...' : 'Withdraw Now'}
                                </button>
                            </div>

                            <p className="text-xs text-[#525252] font-medium text-center">
                                Note: You can only withdraw the minimum amount of {minAmountText}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
