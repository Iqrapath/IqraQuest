
import React, { useState, useEffect } from 'react';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { WalletBalance } from './Components/WalletBalance';
import { UpcomingPayments } from './Components/UpcomingPayments';
import { PaymentHistory } from './Components/PaymentHistory';
import { PaymentSuccessModal } from './Components/PaymentSuccessModal';
import { PageProps } from '@/types';

import { toast } from 'sonner';
import { PaymentInfo } from './Components/PaymentInfo';
import AddPaymentMethodModal from './Components/AddPaymentMethodModal';
import { AddBankDetailsModal } from './Components/AddBankDetailsModal';
import { EditBankDetailsModal } from './Components/EditBankDetailsModal';
import { EditMobileWalletModal } from './Components/EditMobileWalletModal';
import EditPayPalModal from './Components/EditPayPalModal';
import { AddMobileWalletModal } from './Components/AddMobileWalletModal';
import AddPayPalModal from './Components/AddPayPalModal';
import { Icon } from '@iconify/react';

// Types for prompts
interface Transaction {
    id: number;
    amount: number;
    status: string;
    created_at: string;
    description: string;
    type: string;
    currency: string;
    gateway_reference?: string;
    metadata?: any;
}

import { CurrencyCode } from '@/contexts/CurrencyContext';

interface WalletPageProps extends PageProps {
    balance: number;
    currency: CurrencyCode;
    transactions: {
        data: Transaction[];
        links: any[]; // Pagination links
    };
    gateways: any;
    paystack_public_key: string;
    paymentMethods: any[];
}

// Helper function to get wallet provider icon
const getWalletProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
        'mtn': 'arcticons:mymtn-ng',
        'airtel': 'arcticons:airtel',
        'vodafone': 'streamline-logos:vodafone-logo-block',
        'tigo': 'streamline-logos:tigo-logo-block',
        'mpesa': 'streamline-logos:mpesa-logo-block',
    };
    return icons[provider?.toLowerCase()] || 'solar:wallet-bold';
};

export default function WalletIndex({ auth, balance, currency, transactions, paystack_public_key, paymentMethods }: WalletPageProps) {
    const [activeTab, setActiveTab] = useState('Earnings');
    const { flash } = usePage<any>().props;
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false);
    const [showAddBankDetailsModal, setShowAddBankDetailsModal] = useState(false);
    const [showEditBankDetailsModal, setShowEditBankDetailsModal] = useState(false);
    const [showEditMobileWalletModal, setShowEditMobileWalletModal] = useState(false);
    const [showEditPayPalModal, setShowEditPayPalModal] = useState(false);
    const [showAddMobileWalletModal, setShowAddMobileWalletModal] = useState(false);
    const [showAddPayPalModal, setShowAddPayPalModal] = useState(false);

    const [editingBank, setEditingBank] = useState<any>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedNewMethod, setSelectedNewMethod] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [successAmount, setSuccessAmount] = useState('');
    const handleAddPaymentInfo = () => {
        setActiveTab('Payment Method');
        setShowAddPaymentMethodModal(true);
    };

    const handleSavePrimaryMethod = () => {
        if (selectedNewMethod === 'bank-account') {
            setShowAddBankDetailsModal(true);
            setIsAddingNew(false);
            setSelectedNewMethod(null);
        } else if (selectedNewMethod === 'mobile-wallet') {
            setShowAddMobileWalletModal(true);
            setIsAddingNew(false);
            setSelectedNewMethod(null);
        } else if (selectedNewMethod === 'paypal') {
            setShowAddPaymentMethodModal(true); // Opens the new Figma-designed modal
            setIsAddingNew(false);
            setSelectedNewMethod(null);
        }
    };

    const handleSelectPaymentMethod = (methodId: string) => {
        if (methodId === 'bank-account') {
            setShowAddPaymentMethodModal(false);
            setTimeout(() => setShowAddBankDetailsModal(true), 100);
        } else if (methodId === 'mobile-wallet') {
            setShowAddPaymentMethodModal(false);
            setTimeout(() => setShowAddMobileWalletModal(true), 100);
        } else if (methodId === 'paypal') {
            setShowAddPaymentMethodModal(false);
            setTimeout(() => setShowAddPayPalModal(true), 100);
        } else {
            toast.info("This payment method is coming soon");
        }
    };

    const handleEditMethod = (method: any) => {
        setEditingBank(method);
        if (method.type === 'bank_account' || method.type === 'bank-account') {
            setShowEditBankDetailsModal(true);
        } else if (method.type === 'mobile_wallet' || method.type === 'mobile-wallet') {
            setShowEditMobileWalletModal(true);
        } else if (method.type === 'paypal') {
            setShowEditPayPalModal(true);
        }
    };

    useEffect(() => {
        // Updated condition to check for 'guardian.' success messages too if applicable, or generic 'top up'
        if (flash?.success && (flash.success.toLowerCase().includes('top up') || flash.success.toLowerCase().includes('payment') || flash.success.toLowerCase().includes('credited'))) {
            setSuccessMessage(flash.success);

            if (flash.payment_amount) {
                const payCurrency = flash.payment_currency || 'NGN';
                const symbol = payCurrency === 'NGN' ? '₦' : (payCurrency === 'USD' ? '$' : payCurrency);
                // Format with commas
                const formatted = new Intl.NumberFormat('en-US').format(parseFloat(flash.payment_amount));
                setSuccessAmount(`${symbol}${formatted}`);
            }

            setShowSuccessModal(true);
            toast.success(flash.success);
        }
    }, [flash]);

    return (
        <>

            <Head title="Payments & Wallet" />

            <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6">

                {/* Header Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm p-2 w-full max-w-3xl overflow-x-auto hide-scrollbar">
                    <div className="flex space-x-2 w-full min-w-max md:min-w-0">
                        {['Earnings', 'Payment Info', 'Payment Method'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-center text-sm font-medium transition-colors duration-200 whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#2D7A70] text-white shadow-md' // Active state (Greenish)
                                    : 'text-gray-500 hover:text-gray-700 bg-transparent'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'Earnings' && (
                    <div className="space-y-6">
                        {/* Wallet Balance Section */}
                        <WalletBalance balance={balance} paystackPublicKey={paystack_public_key} />

                        {/* Upcoming Payments Due Section */}
                        {/* <UpcomingPayments /> */}

                        {/* Payment History Section */}
                        {/* <PaymentHistory transactions={transactions} /> */}
                    </div>
                )}

                {activeTab === 'Payment Info' && (
                    <PaymentInfo onAddPaymentInfo={handleAddPaymentInfo} paymentMethods={paymentMethods} onEditMethod={handleEditMethod} />
                )}

                {activeTab === 'Payment Method' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Header Text */}
                        <div>
                            <p className="text-gray-600 text-lg font-light">
                                Easily manage your payments methods through our secure system.
                            </p>
                        </div>

                        {/* Payment Type Selector Card (Dynamic) */}
                        {(() => {
                            const primaryMethod = paymentMethods && paymentMethods.length > 0 ? paymentMethods[0] : null;
                            let icon = "solar:transfer-horizontal-bold";
                            let text = "Bank Account (Direct Withdrawal)";

                            if (primaryMethod) {
                                if (primaryMethod.type === 'mobile_wallet') {
                                    icon = getWalletProviderIcon(primaryMethod.wallet_provider);
                                    text = `Mobile Wallet (${primaryMethod.wallet_provider?.toUpperCase() || 'Mobile Money'})`;
                                } else if (primaryMethod.type === 'paypal') {
                                    icon = "logos:paypal";
                                    text = "PayPal";
                                }
                            }

                            return (
                                <div className="border border-gray-300 rounded-[30px] p-6 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-4">
                                        <Icon icon={icon} className="w-6 h-6 text-gray-900" />
                                        <span className="text-gray-900 font-medium text-lg">{text}</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full border-[6px] border-[#2D7A70] bg-white"></div>
                                </div>
                            );
                        })()}

                        {/* Saved Methods List */}
                        <div className="space-y-6">
                            {paymentMethods && paymentMethods.length > 0 ? (
                                paymentMethods.map((method: any, index: number) => (
                                    <div key={method.id} className="relative pl-2">
                                        <div className="flex justify-between items-start md:items-center group">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#10AF88] flex items-center justify-center shrink-0">
                                                        <Icon icon="solar:check-read-bold" className="text-white w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-lg">
                                                        {index + 1}. {method.type === 'mobile_wallet' ? 'Mobile Wallet' : 'Bank Account'}
                                                    </h4>
                                                </div>

                                                <div className="pl-9 space-y-1">
                                                    {method.type === 'bank_account' || method.type === 'bank-account' ? (
                                                        <>
                                                            <p className="text-gray-900 font-medium text-base">
                                                                {method.bank_name}
                                                            </p>
                                                            <p className="text-gray-500 text-sm font-light">
                                                                {method.bank_account_name} <span className="mx-1 text-gray-300">|</span> {method.bank_account_number}
                                                            </p>
                                                        </>
                                                    ) : method.type === 'mobile_wallet' ? (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon={getWalletProviderIcon(method.wallet_provider)} className="w-5 h-5 text-gray-700" />
                                                                <p className="text-gray-900 font-medium text-base">
                                                                    {method.wallet_provider?.toUpperCase()}
                                                                </p>
                                                            </div>
                                                            <p className="text-gray-500 text-sm font-light">
                                                                {method.wallet_account_name} <span className="mx-1 text-gray-300">|</span> {method.wallet_phone_number}
                                                            </p>
                                                        </>
                                                    ) : method.type === 'paypal' ? (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="logos:paypal" className="w-5 h-5" />
                                                                <p className="text-gray-900 font-medium text-base">
                                                                    PayPal
                                                                </p>
                                                            </div>
                                                            <p className="text-gray-500 text-sm font-light">
                                                                {method.paypal_email}
                                                            </p>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleEditMethod(method)}
                                                className="flex items-center text-[#2D7A70] font-medium text-sm hover:underline"
                                            >
                                                Change
                                                <Icon icon="solar:alt-arrow-right-linear" className="ml-1 w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 font-light">
                                    No payment methods saved yet.
                                </div>
                            )}
                        </div>

                        {/* Add New Section */}
                        <button
                            onClick={() => setShowAddPaymentMethodModal(true)}
                            className="flex items-center text-[#2D7A70] hover:text-[#24635b] font-medium text-base transition-colors group pl-2"
                        >
                            <Icon icon="solar:add-circle-outline" className="w-6 h-6 mr-3" />
                            <span className="group-hover:underline">Add New Payment Method</span>
                        </button>
                    </div>
                )}

                <PaymentSuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    message={successMessage || "Top up successfully"}
                    amount={successAmount}
                />

                <AddPaymentMethodModal
                    isOpen={showAddPaymentMethodModal}
                    onClose={() => setShowAddPaymentMethodModal(false)}
                    onSelectMethod={handleSelectPaymentMethod}
                />

                <AddBankDetailsModal
                    isOpen={showAddBankDetailsModal}
                    onClose={() => setShowAddBankDetailsModal(false)}
                />

                <EditBankDetailsModal
                    isOpen={showEditBankDetailsModal}
                    onClose={() => {
                        setShowEditBankDetailsModal(false);
                        setEditingBank(null);
                    }}
                    bankDetails={editingBank}
                />

                <EditMobileWalletModal
                    isOpen={showEditMobileWalletModal}
                    onClose={() => {
                        setShowEditMobileWalletModal(false);
                        setEditingBank(null);
                    }}
                    walletDetails={editingBank}
                />

                <EditPayPalModal
                    isOpen={showEditPayPalModal}
                    onClose={() => {
                        setShowEditPayPalModal(false);
                        setEditingBank(null);
                    }}
                    paypalDetails={editingBank}
                />

                <AddMobileWalletModal
                    isOpen={showAddMobileWalletModal}
                    onClose={() => setShowAddMobileWalletModal(false)}
                />

                <AddPayPalModal
                    isOpen={showAddPayPalModal}
                    onClose={() => setShowAddPayPalModal(false)}
                />

            </div>

        </>
    );
}

WalletIndex.layout = (page: React.ReactNode) => <GuardianLayout children={page} hideRightSidebar={true} />;
