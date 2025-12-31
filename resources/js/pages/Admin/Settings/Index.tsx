import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettingsTab from './components/GeneralSettingsTab';
import FinancialSettingsTab from './components/FinancialSettingsTab';
import FeatureControlsTab from './components/FeatureControlsTab';
import AdminsManagementTab from './components/AdminsManagementTab';

interface Props {
    activeTab: string;
    settings: any;
    paymentSettings: any;
    roles: any[];
    admins: any[];
    availablePermissions: any;
}

export default function SettingsIndex({
    activeTab,
    settings,
    paymentSettings,
    roles,
    admins,
    availablePermissions
}: Props) {
    const [currentTab, setCurrentTab] = useState(activeTab);

    const handleTabChange = (value: string) => {
        setCurrentTab(value);
        // Update URL without full reload to maintain state if needed, 
        // but typically Inertia handles this via links. 
        // Here we just use state for immediate feedback.
    };

    return (
        <AdminLayout hideRightSidebar={true}>
            <Head title="Settings & Security" />

            <div className="p-6 lg:p-10 font-[Nunito]">
                <div className="mb-8">
                    <h1 className="text-[24px] font-bold text-[#101928]">Settings & Security</h1>
                    <div className="flex items-center gap-2 mt-2 text-[#667085] text-sm">
                        <span>Dashboard</span>
                        <span>•</span>
                        <span className="text-[#338078] font-medium">Settings & Security</span>
                    </div>
                </div>

                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <div className="bg-white px-6 py-3 rounded-[14px] shadow-[0px_0px_62px_0px_rgba(51,128,120,0.12)] mb-10 inline-block max-w-full overflow-x-auto overflow-y-hidden no-scrollbar">
                        <TabsList className="bg-transparent h-auto p-0 border-none gap-[9px] flex items-center justify-start flex-nowrap w-max">
                            <TabsTrigger
                                value="general"
                                className="px-4 py-2 rounded-[12px] text-[19px] font-light text-[#6B7280] data-[state=active]:bg-[#338078] data-[state=active]:text-white data-[state=active]:font-semibold transition-all shadow-none"
                            >
                                General Settings
                            </TabsTrigger>
                            <TabsTrigger
                                value="financial"
                                className="px-4 py-2 rounded-[12px] text-[19px] font-light text-[#6B7280] data-[state=active]:bg-[#338078] data-[state=active]:text-white data-[state=active]:font-semibold transition-all shadow-none"
                            >
                                Financial Settings
                            </TabsTrigger>
                            <TabsTrigger
                                value="features"
                                className="px-4 py-2 rounded-[12px] text-[19px] font-light text-[#6B7280] data-[state=active]:bg-[#338078] data-[state=active]:text-white data-[state=active]:font-semibold transition-all shadow-none"
                            >
                                Feature Controls
                            </TabsTrigger>
                            <TabsTrigger
                                value="admins"
                                className="px-4 py-2 rounded-[12px] text-[19px] font-light text-[#6B7280] data-[state=active]:bg-[#338078] data-[state=active]:text-white data-[state=active]:font-semibold transition-all shadow-none whitespace-nowrap"
                            >
                                Admin & Roles Management
                            </TabsTrigger>
                            <TabsTrigger
                                value="backup"
                                className="px-4 py-2 rounded-[12px] text-[19px] font-light text-[#6B7280] data-[state=active]:bg-[#338078] data-[state=active]:text-white data-[state=active]:font-semibold transition-all shadow-none whitespace-nowrap"
                            >
                                Backup & Security Settings
                            </TabsTrigger>
                            <TabsTrigger
                                value="close-account"
                                className="px-4 py-2 rounded-[12px] text-[19px] font-light text-[#6B7280] data-[state=active]:bg-[#338078] data-[state=active]:text-white data-[state=active]:font-semibold transition-all shadow-none whitespace-nowrap"
                            >
                                Close Your Account
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="general">
                        <GeneralSettingsTab settings={settings.general} localization={settings.localization} />
                    </TabsContent>

                    <TabsContent value="financial">
                        <FinancialSettingsTab settings={paymentSettings} />
                    </TabsContent>

                    <TabsContent value="features">
                        <FeatureControlsTab toggles={settings.feature_controls} />
                    </TabsContent>

                    <TabsContent value="admins">
                        <AdminsManagementTab roles={roles} admins={admins} availablePermissions={availablePermissions} />
                    </TabsContent>

                    <TabsContent value="backup">
                        <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-sm max-w-[800px]">
                            <h3 className="text-[18px] font-semibold text-[#101928] mb-6">Backup & Security</h3>
                            <p className="text-[#667085] text-sm">Automated backups and security hardening options will be available here.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="close-account">
                        <div className="max-w-[800px]">
                            <div className="bg-red-50 border border-red-100 rounded-[16px] p-8 space-y-6">
                                <div>
                                    <h3 className="text-[18px] font-semibold text-red-600 mb-2">Close Administrative Account</h3>
                                    <p className="text-red-700 text-sm">
                                        Warning: Closing this account is permanent. All administrative access, associated data, and logs will be revoked immediately.
                                    </p>
                                </div>
                                <button className="bg-red-600 text-white px-8 py-3 rounded-[30px] font-semibold hover:bg-red-700 transition-all shadow-sm">
                                    Permanently Close Account
                                </button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
