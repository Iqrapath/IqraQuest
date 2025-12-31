import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';

export default function DangerZone() {
    return (
        <section className="space-y-6">
            <h3 className="text-[18px] font-semibold text-red-600">Danger Zone</h3>

            <Card className="border-red-100 bg-red-50/30 overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                        <Icon icon="ph:warning-circle-fill" className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-800">
                                Be careful with these actions.
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                                Closing this account will delete all admin data, user access, and platform controls. This action is irreversible.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-red-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500">
                                <Icon icon="ph:user-minus-light" className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#101928]">Deactivate Account</h4>
                                <p className="text-xs text-[#667085]">Temporarily disable access to this admin account.</p>
                            </div>
                        </div>
                        <button className="text-red-600 text-sm font-bold hover:underline">Deactivate</button>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm">
                                <Icon icon="ph:trash-light" className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#101928]">Delete Admin Account</h4>
                                <p className="text-xs text-[#667085]">Remove this admin user from the platform forever.</p>
                            </div>
                        </div>
                        <button className="text-red-600 text-sm font-bold hover:underline">Delete Me</button>
                    </div>
                </div>
            </Card>
        </section>
    );
}
