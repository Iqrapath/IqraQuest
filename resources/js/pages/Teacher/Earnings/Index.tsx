import React, { useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head } from '@inertiajs/react';
import { AddBankDetailsModal } from './Components/AddBankDetailsModal';
import { EditBankDetailsModal } from './Components/EditBankDetailsModal';
import { AddMobileWalletModal } from './Components/AddMobileWalletModal';
import { EditMobileWalletModal } from './Components/EditMobileWalletModal';
import AddPayPalModal from './Components/AddPayPalModal';
import EditPayPalModal from './Components/EditPayPalModal';

import EarningsTab from './Components/EarningsTab';
import PaymentInfoTab from './Components/PaymentInfoTab';
import PaymentMethodTab from './Components/PaymentMethodTab';

interface Props {
    balance: number;
    availableBalance: number;
    pendingPayouts: number;
    totalEarnings: number;
    thisMonthEarnings: number;
    recentTransactions: any;
    paymentMethods: any[];
    automaticPayouts: boolean;
}

function Index({
    balance,
    availableBalance,
    pendingPayouts,
    totalEarnings,
    thisMonthEarnings,
    recentTransactions,
    paymentMethods,
    automaticPayouts,
}: Props) {
    const [activeTab, setActiveTab] = useState<'earnings' | 'payment-info' | 'payment-method'>('earnings');
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    const [showEditBankModal, setShowEditBankModal] = useState(false);
    const [showAddWalletModal, setShowAddWalletModal] = useState(false);
    const [showEditWalletModal, setShowEditWalletModal] = useState(false);
    const [showAddPayPalModal, setShowAddPayPalModal] = useState(false);
    const [showEditPayPalModal, setShowEditPayPalModal] = useState(false);

    const [editingMethod, setEditingMethod] = useState<any>(null);

    const handleEditMethod = (method: any) => {
        setEditingMethod(method);
        if (method.type === 'bank_account') {
            setShowEditBankModal(true);
        } else if (method.type === 'mobile_wallet') {
            setShowEditWalletModal(true);
        } else if (method.type === 'paypal') {
            setShowEditPayPalModal(true);
        }
    };

    return (
        <>
            <Head title="Earnings & Wallet" />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Page Header */}
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings & Wallet</h1>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm p-2 w-full max-w-3xl overflow-x-auto hide-scrollbar mb-6">
                    <div className="flex space-x-2 w-full min-w-max md:min-w-0">
                        {['earnings', 'payment-info', 'payment-method'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'earnings' | 'payment-info' | 'payment-method')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-center text-sm font-medium transition-colors duration-200 whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#2D7A70] text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 bg-transparent'
                                    }`}
                            >
                                {tab === 'earnings' ? 'Earnings' : tab === 'payment-info' ? 'Payment Info' : 'Payment Method'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'earnings' && (
                    <EarningsTab
                        totalEarnings={totalEarnings}
                        availableBalance={availableBalance}
                        recentTransactions={recentTransactions}
                        automaticPayouts={automaticPayouts}
                        paymentMethods={paymentMethods}
                    />
                )}

                {activeTab === 'payment-info' && (
                    <PaymentInfoTab
                        paymentMethods={paymentMethods}
                        onAddPaymentInfo={() => setActiveTab('payment-method')}
                        onEditMethod={handleEditMethod}
                    />
                )}

                {activeTab === 'payment-method' && (
                    <PaymentMethodTab
                        paymentMethods={paymentMethods}
                        onAddBank={() => setShowAddBankModal(true)}
                        onAddWallet={() => setShowAddWalletModal(true)}
                        onAddPayPal={() => setShowAddPayPalModal(true)}
                        onEditMethod={handleEditMethod}
                    />
                )}
            </div>

            {/* Modals */}
            <AddBankDetailsModal isOpen={showAddBankModal} onClose={() => setShowAddBankModal(false)} />
            <EditBankDetailsModal isOpen={showEditBankModal} onClose={() => { setShowEditBankModal(false); setEditingMethod(null); }} bankDetails={editingMethod} />

            <AddMobileWalletModal isOpen={showAddWalletModal} onClose={() => setShowAddWalletModal(false)} />
            <EditMobileWalletModal isOpen={showEditWalletModal} onClose={() => { setShowEditWalletModal(false); setEditingMethod(null); }} walletDetails={editingMethod} />

            <AddPayPalModal isOpen={showAddPayPalModal} onClose={() => setShowAddPayPalModal(false)} />
            <EditPayPalModal isOpen={showEditPayPalModal} onClose={() => { setShowEditPayPalModal(false); setEditingMethod(null); }} paypalDetails={editingMethod} />
        </>
    );
}

Index.layout = (page: React.ReactNode) => <TeacherLayout children={page} hideRightSidebar={true} />;

export default Index;
