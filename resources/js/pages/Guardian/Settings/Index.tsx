import { useState, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { enable as enable2FA, disable as disable2FA } from '@/routes/two-factor';

interface Currency {
    code: string;
    name: string;
    symbol: string;
}

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
        two_factor_enabled: boolean;
        email_verified_at: string | null;
    };
    settings: {
        is_online: boolean;
        username: string;
        base_currency: string;
        email_notifications: boolean;
        sms_notifications: boolean;
        mobile_alerts: boolean;
        account_deactivated: boolean;
    };
    currencies: Currency[];
    mustVerifyEmail: boolean;
    requiresConfirmation: boolean;
}

type TabType = 'account' | 'security' | 'notifications';

export default function SettingsIndex({ user, settings, currencies, mustVerifyEmail, requiresConfirmation }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>('account');
    const { flash } = usePage<any>().props;

    const tabs = [
        { id: 'account' as TabType, label: 'Account Info' },
        { id: 'security' as TabType, label: 'Security Settings' },
        { id: 'notifications' as TabType, label: 'Notification' },
    ];

    return (
        <>
            <Head title="Settings" />

            <div className="max-w-[600px]">
                {/* Page Title */}
                <h1 className="font-['Nunito'] font-semibold text-[20px] text-black mb-8">
                    Account Settings
                </h1>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {flash.error}
                    </div>
                )}
                {flash?.info && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                        {flash.info}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="bg-white rounded-[13px] shadow-[0px_0px_58px_0px_rgba(51,128,120,0.12)] px-[30px] py-[11px] mb-8 inline-flex">
                    <div className="flex items-center gap-[38px]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-[15px] py-[7px] rounded-[11px] font-['Nunito'] text-[19px] transition-all",
                                    activeTab === tab.id
                                        ? "bg-[#338078] text-white"
                                        : "text-[#6b7280] hover:bg-gray-100"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'account' && (
                    <AccountInfoTab user={user} settings={settings} currencies={currencies} mustVerifyEmail={mustVerifyEmail} />
                )}
                {activeTab === 'security' && (
                    <SecuritySettingsTab user={user} settings={settings} requiresConfirmation={requiresConfirmation} />
                )}
                {activeTab === 'notifications' && (
                    <NotificationSettingsTab settings={settings} />
                )}
            </div>
        </>
    );
}


// Account Info Tab Component
function AccountInfoTab({ user, settings, currencies, mustVerifyEmail }: { user: Props['user']; settings: Props['settings']; currencies: Currency[]; mustVerifyEmail: boolean }) {
    const { data, setData, put, processing, errors } = useForm({
        is_online: settings.is_online,
        username: settings.username,
        base_currency: settings.base_currency,
    });

    const verificationForm = useForm({});
    const { errors: pageErrors } = usePage<any>().props;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/guardian/settings/account');
    };

    const handleResendVerification = () => {
        verificationForm.post('/guardian/settings/resend-verification');
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Online Status - Outside card */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <p className="font-['Nunito'] font-semibold text-[16px] text-[#111928]">
                        ONLINE STATUS
                    </p>
                    <p className="font-['Nunito'] font-light text-[12px] text-[#111928]">
                        Let teachers know you are online
                    </p>
                </div>
                <ToggleSwitch
                    checked={data.is_online}
                    onChange={(checked) => setData('is_online', checked)}
                />
            </div>

            {/* Form Card */}
            <div className="bg-white border border-[rgba(0,0,0,0.15)] rounded-[15px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Username Field */}
                    <div className="flex flex-col gap-2">
                        <label className="font-['Nunito'] font-normal text-[12px] text-[#111928]">
                            Username
                        </label>
                        <div className="bg-[#f4f4fa] border border-[#caced7] rounded-[12px] flex items-center px-5 py-3">
                            <Icon icon="icon-park-outline:edit-name" className="w-[18px] h-[18px] text-[#6b7280] mr-3" />
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="bg-transparent font-['Nunito'] font-light text-[14px] text-[#111928] placeholder:text-[#6b7280] outline-none flex-1"
                                placeholder="Enter your username"
                            />
                        </div>
                        {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
                    </div>

                    {/* Email Field with Verification Status */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="font-['Nunito'] font-normal text-[12px] text-[#111928]">
                                Email Address
                            </label>
                            {mustVerifyEmail && (
                                user.email_verified_at ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                                        <Icon icon="mdi:check-circle" className="w-3 h-3" />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                                        <Icon icon="mdi:alert-circle" className="w-3 h-3" />
                                        Unverified
                                    </span>
                                )
                            )}
                        </div>
                        <div className="bg-[#f4f4fa] border border-[#caced7] rounded-[12px] flex items-center px-5 py-3">
                            <Icon icon="carbon:email" className="w-[18px] h-[18px] text-[#6b7280] mr-3" />
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-transparent font-['Nunito'] font-light text-[14px] text-[#6b7280] outline-none flex-1 cursor-not-allowed"
                            />
                        </div>
                        {/* Resend Verification Button */}
                        {mustVerifyEmail && !user.email_verified_at && (
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={verificationForm.processing}
                                    className="text-[#338078] text-[12px] font-['Nunito'] underline hover:text-[#2a6b64] disabled:opacity-50 self-start"
                                >
                                    {verificationForm.processing ? 'Sending...' : 'Resend verification email'}
                                </button>
                                {pageErrors?.verification && (
                                    <p className="text-red-500 text-xs">{pageErrors.verification}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Currency Row (Standalone since gender is removed) */}
                    <div className="flex flex-col gap-2">
                        <label className="font-['Nunito'] font-normal text-[12px] text-[#111928]">
                            Base Currency
                        </label>
                        <Select value={data.base_currency} onValueChange={(value) => setData('base_currency', value)}>
                            <SelectTrigger className="bg-[#f4f4fa] border border-[#caced7] rounded-[12px] h-auto px-5 py-3 font-['Nunito'] font-light text-[14px] text-[#6b7280]">
                                <div className="flex items-center gap-3">
                                    <Icon icon="mdi:currency-usd" className="w-[18px] h-[18px] text-[#6b7280]" />
                                    <SelectValue placeholder="Select currency" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        {c.symbol} {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="self-start bg-[#338078] text-white font-['Poppins'] font-medium text-[13px] px-6 py-4 rounded-[24px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50 mt-2"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}



// Security Settings Tab Component
function SecuritySettingsTab({ user, settings, requiresConfirmation }: { user: Props['user']; settings: Props['settings']; requiresConfirmation: boolean }) {
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const deactivationForm = useForm({});

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors: twoFactorErrors,
    } = useTwoFactorAuth();

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/guardian/settings/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleEnable2FA = () => {
        router.post(enable2FA.url(), {}, {
            onSuccess: () => {
                setShowSetupModal(true);
            },
        });
    };

    const handleDisable2FA = () => {
        if (confirm('Are you sure you want to disable two-factor authentication?')) {
            router.delete(disable2FA.url());
        }
    };

    const handleToggleDeactivation = () => {
        const message = settings.account_deactivated
            ? 'Are you sure you want to reactivate your account?'
            : 'Are you sure you want to deactivate your account?';
        if (confirm(message)) {
            deactivationForm.post('/guardian/settings/deactivation');
        }
    };

    const handleDeleteAccount = (e: React.FormEvent) => {
        e.preventDefault();
        deleteForm.delete('/guardian/settings/delete-account', {
            onError: () => passwordInputRef.current?.focus(),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Change Password Card */}
            <div className="bg-white border border-[rgba(0,0,0,0.15)] rounded-[15px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-6">
                <h3 className="font-['Nunito'] font-semibold text-[18px] text-[#111928] mb-5">
                    Change Password
                </h3>
                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                    {/* Old Password */}
                    <div className="flex flex-col gap-2">
                        <label className="font-['Nunito'] font-normal text-[12px] text-[#111928]">
                            Old Password
                        </label>
                        <div className="bg-[#f4f4fa] border border-[#caced7] rounded-[12px] flex items-center px-5 py-3">
                            <Icon icon="mdi:lock-outline" className="w-[18px] h-[18px] text-[#6b7280] mr-3" />
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                className="bg-transparent font-['Nunito'] font-light text-[14px] text-[#111928] placeholder:text-[#6b7280] outline-none flex-1"
                                placeholder="Enter your old password"
                            />
                        </div>
                        {passwordForm.errors.current_password && (
                            <p className="text-red-500 text-xs">{passwordForm.errors.current_password}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-2">
                        <label className="font-['Nunito'] font-normal text-[12px] text-[#111928]">
                            New Password
                        </label>
                        <div className="bg-[#f4f4fa] border border-[#caced7] rounded-[12px] flex items-center px-5 py-3">
                            <Icon icon="mdi:lock-outline" className="w-[18px] h-[18px] text-[#6b7280] mr-3" />
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className="bg-transparent font-['Nunito'] font-light text-[14px] text-[#111928] placeholder:text-[#6b7280] outline-none flex-1"
                                placeholder="Enter new password"
                            />
                        </div>
                        {passwordForm.errors.password && (
                            <p className="text-red-500 text-xs">{passwordForm.errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-2">
                        <label className="font-['Nunito'] font-normal text-[12px] text-[#111928]">
                            Confirm New Password
                        </label>
                        <div className="bg-[#f4f4fa] border border-[#caced7] rounded-[12px] flex items-center px-5 py-3">
                            <Icon icon="mdi:lock-outline" className="w-[18px] h-[18px] text-[#6b7280] mr-3" />
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                className="bg-transparent font-['Nunito'] font-light text-[14px] text-[#111928] placeholder:text-[#6b7280] outline-none flex-1"
                                placeholder="Enter new password again"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="bg-[#338078] text-white font-['Poppins'] font-medium text-[13px] px-6 py-3 rounded-[8px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                        >
                            {passwordForm.processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="py-4 border-b border-dashed border-gray-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-2 max-w-[400px]">
                        <div className="flex items-center gap-2">
                            <p className="font-['Nunito'] font-semibold text-[16px] text-[#111928]">
                                Two-Factor Authentication
                            </p>
                            {user.two_factor_enabled ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                                    <Icon icon="mdi:check-circle" className="w-3 h-3" />
                                    Enabled
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                                    Disabled
                                </span>
                            )}
                        </div>
                        <p className="font-['Nunito'] font-light text-[12px] text-[#6b7280]">
                            {user.two_factor_enabled
                                ? 'Your account is protected with 2FA. You can view recovery codes or disable it.'
                                : "Add an extra layer of security by enabling two-factor authentication."}
                        </p>
                    </div>
                    {user.two_factor_enabled ? (
                        <button
                            onClick={handleDisable2FA}
                            className="bg-red-500 text-white font-['Poppins'] font-medium text-[12px] px-4 py-2 rounded-[8px] hover:bg-red-600 transition-colors"
                        >
                            Disable 2FA
                        </button>
                    ) : (
                        <button
                            onClick={hasSetupData ? () => setShowSetupModal(true) : handleEnable2FA}
                            className="bg-[#338078] text-white font-['Poppins'] font-medium text-[12px] px-4 py-2 rounded-[8px] hover:bg-[#2a6b64] transition-colors"
                        >
                            {hasSetupData ? 'Continue Setup' : 'Enable 2FA'}
                        </button>
                    )}
                </div>

                {/* Recovery Codes when 2FA is enabled */}
                {user.two_factor_enabled && (
                    <div className="mt-4">
                        <TwoFactorRecoveryCodes
                            recoveryCodesList={recoveryCodesList}
                            fetchRecoveryCodes={fetchRecoveryCodes}
                            errors={twoFactorErrors}
                        />
                    </div>
                )}
            </div>

            {/* 2FA Setup Modal */}
            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={user.two_factor_enabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={twoFactorErrors}
            />

            {/* Account Deactivation */}
            <div className="flex items-start justify-between py-4 border-b border-dashed border-gray-300">
                <div className="flex flex-col gap-3 max-w-[400px]">
                    <p className="font-['Nunito'] font-semibold text-[16px] text-[#111928]">
                        Account Deactivation
                    </p>
                    <p className="font-['Nunito'] font-medium text-[12px] text-[#111928]">
                        Temporarily hide your account (reversible)
                    </p>
                    <ul className="list-disc list-inside text-[12px] text-[#6b7280] font-['Nunito'] space-y-1">
                        <li>Your profile won't be visible to teachers</li>
                        <li>Active sessions may be affected</li>
                        <li>You can reactivate anytime</li>
                    </ul>
                </div>
                <ToggleSwitch
                    checked={settings.account_deactivated}
                    onChange={handleToggleDeactivation}
                />
            </div>

            {/* Account Deletion */}
            <div className="py-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-3 max-w-[400px]">
                        <p className="font-['Nunito'] font-semibold text-[16px] text-red-600">
                            Delete Account
                        </p>
                        <p className="font-['Nunito'] font-medium text-[12px] text-[#111928]">
                            Permanently delete your account and all data
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <p className="font-['Nunito'] text-[12px] text-red-700 font-medium mb-1">
                                ⚠️ This action cannot be undone
                            </p>
                            <ul className="list-disc list-inside text-[11px] text-red-600 font-['Nunito'] space-y-0.5">
                                <li>All your data will be permanently deleted</li>
                                <li>You will lose access to all sessions and history</li>
                                <li>Any active bookings will be cancelled</li>
                            </ul>
                        </div>
                    </div>

                    {/* Delete Account Dialog */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="bg-red-500 text-white font-['Poppins'] font-medium text-[12px] px-4 py-2 rounded-[8px] hover:bg-red-600 transition-colors">
                                Delete Account
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogTitle className="text-red-600">Delete Your Account?</DialogTitle>
                            <DialogDescription>
                                This action is permanent and cannot be undone. Enter your password to confirm.
                            </DialogDescription>
                            <form onSubmit={handleDeleteAccount} className="space-y-4 mt-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-['Nunito'] font-normal text-[12px] text-[#111928]">
                                        Confirm Password
                                    </label>
                                    <div className="bg-[#f4f4fa] border border-[#caced7] rounded-[12px] flex items-center px-5 py-3">
                                        <Icon icon="mdi:lock-outline" className="w-[18px] h-[18px] text-[#6b7280] mr-3" />
                                        <input
                                            ref={passwordInputRef}
                                            type="password"
                                            value={deleteForm.data.password}
                                            onChange={(e) => deleteForm.setData('password', e.target.value)}
                                            className="bg-transparent font-['Nunito'] font-light text-[14px] text-[#111928] placeholder:text-[#6b7280] outline-none flex-1"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                    {deleteForm.errors.password && (
                                        <p className="text-red-500 text-xs">{deleteForm.errors.password}</p>
                                    )}
                                </div>
                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <button
                                            type="button"
                                            className="bg-gray-200 text-gray-700 font-['Poppins'] font-medium text-[13px] px-4 py-2 rounded-[8px] hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </DialogClose>
                                    <button
                                        type="submit"
                                        disabled={deleteForm.processing}
                                        className="bg-red-600 text-white font-['Poppins'] font-medium text-[13px] px-4 py-2 rounded-[8px] hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {deleteForm.processing ? 'Deleting...' : 'Delete Account'}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}


// Notification Settings Tab Component
function NotificationSettingsTab({ settings }: { settings: Props['settings'] }) {
    const { data, setData, put, processing } = useForm({
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        mobile_alerts: settings.mobile_alerts,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/guardian/settings/notifications');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="font-['Nunito'] font-semibold text-[16px] text-[#111928]">
                        Email Notifications
                    </p>
                    <p className="font-['Nunito'] font-light text-[12px] text-[#6b7280]">
                        Receive updates via email
                    </p>
                </div>
                <ToggleSwitch
                    checked={data.email_notifications}
                    onChange={(checked) => setData('email_notifications', checked)}
                />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="font-['Nunito'] font-semibold text-[16px] text-[#111928]">
                        SMS Notifications
                    </p>
                    <p className="font-['Nunito'] font-light text-[12px] text-[#6b7280]">
                        Receive text alerts on mobile
                    </p>
                </div>
                <ToggleSwitch
                    checked={data.sms_notifications}
                    onChange={(checked) => setData('sms_notifications', checked)}
                />
            </div>

            {/* Mobile Alerts (In-App) */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="font-['Nunito'] font-semibold text-[16px] text-[#111928]">
                        In-App Notifications
                    </p>
                    <p className="font-['Nunito'] font-light text-[12px] text-[#6b7280]">
                        Show notifications in the bell icon
                    </p>
                </div>
                <ToggleSwitch
                    checked={data.mobile_alerts}
                    onChange={(checked) => setData('mobile_alerts', checked)}
                />
            </div>



            {/* Divider */}
            <div className="border-t border-dashed border-gray-300" />

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-[#338078] text-white font-['Poppins'] font-medium text-[13px] px-6 py-3 rounded-[8px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

// Toggle Switch Component - Figma style
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "relative w-[40px] h-[22px] rounded-full transition-colors border-[1.5px] flex-shrink-0",
                checked
                    ? "bg-[#338078] border-[#338078]"
                    : "bg-white border-[#818181]"
            )}
        >
            <span
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full transition-all",
                    checked
                        ? "bg-white right-[4px]"
                        : "bg-[#818181] left-[4px]"
                )}
            />
        </button>
    );
}

// Checkbox Component - Figma style (teal rounded checkbox)
function Checkbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "w-[22px] h-[22px] rounded-[4px] border-2 flex items-center justify-center transition-colors flex-shrink-0",
                checked
                    ? "bg-[#338078] border-[#338078]"
                    : "bg-white border-[#caced7]"
            )}
        >
            {checked && (
                <Icon icon="mdi:check" className="w-4 h-4 text-white" />
            )}
        </button>
    );
}

SettingsIndex.layout = (page: React.ReactNode) => <GuardianLayout children={page} />;
