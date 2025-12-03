import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import TeacherStatusBadge from '@/components/Teachers/TeacherStatusBadge';

interface TeacherProfileHeaderProps {
    teacher: {
        id: number;
        user: {
            name: string;
            email: string;
            role: string;
            avatar?: string;
        };
        city: string;
        country: string;
        status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
    };
    earnings: {
        wallet_balance: number;
        total_earned: number;
        pending_payouts: number;
        currency: string;
    };
}

export default function TeacherProfileHeader({ teacher, earnings }: TeacherProfileHeaderProps) {
    return (
        <div className="relative w-full mb-8">
            {/* Background Image Header */}
            <div className="w-full h-[120px] md:h-[200px] rounded-t-[24px] overflow-hidden">
                <img
                    src="/images/Group 1000006846.png"
                    alt="Header Background"
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Content Container - Overlapping */}
            <div className="relative -mt-[60px] md:-mt-[100px] px-4 md:px-[48px] z-10">
                <div className="flex flex-col xl:flex-row items-center xl:items-end justify-between gap-4 md:gap-8">
                    {/* LEFT SIDE - Profile Info */}
                    <div className="flex flex-col gap-3 md:gap-[16px] mb-2 md:mb-4 items-center">
                        {/* Profile Photo */}
                        <div className="w-[100px] h-[100px] md:w-[147px] md:h-[147px] rounded-full overflow-hidden border-4 md:border-[6px] border-white shadow-xl bg-white">
                            {teacher.user.avatar ? (
                                <img
                                    src={`/storage/${teacher.user.avatar}`}
                                    alt={teacher.user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#338078] to-[#FFCC00] flex items-center justify-center">
                                    <span className="text-white font-bold text-3xl md:text-[48px] font-['Nunito']">
                                        {teacher.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-2 text-center">
                            {/* Name */}
                            <h1 className="font-['Nunito'] font-semibold text-2xl md:text-[32px] leading-[1.2] text-[#141522]">
                                {teacher.user.name}
                            </h1>

                            {/* Role */}
                            <p className="font-['Nunito'] text-sm md:text-[16px] leading-[1.2] text-gray-600 mt-1 uppercase">
                                {teacher.user.role}
                            </p>

                            {/* Location */}
                            <div className="flex gap-[6px] items-center justify-center mt-2">
                                <Icon icon="ion:location-outline" className="w-[18px] h-[18px] text-gray-500" />
                                <p className="font-['Nunito'] text-[14px] leading-[1.2] text-gray-500">
                                    {teacher.city}, {teacher.country}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-3 flex justify-center">
                                <TeacherStatusBadge status={teacher.status} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - Earnings Card */}
                    <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] p-4 md:p-[24px] w-full md:min-w-[440px] mb-8 md:mb-20">
                        {/* Card Title */}
                        <h2 className="font-['Nunito'] font-semibold text-base md:text-[18px] text-[#141522] mb-4 md:mb-[20px]">
                            Earnings
                        </h2>

                        {/* Stats Row */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-[12px] mb-4 md:mb-[16px]">
                            {/* Wallet Balance */}
                            <div className="flex-1 bg-[#E8F5FF] rounded-[12px] p-3 md:p-[16px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon icon="mdi:wallet-outline" className="w-5 h-5 text-[#338078]" />
                                    <p className="font-['Nunito'] font-bold text-lg md:text-[20px] text-[#141522]">
                                        {earnings.currency}{earnings.wallet_balance.toLocaleString()}
                                    </p>
                                </div>
                                <p className="font-['Poppins'] text-[10px] md:text-[11px] text-gray-500">
                                    Wallet Balance
                                </p>
                            </div>

                            {/* Total Earned */}
                            <div className="flex-1 bg-[#E8F5FF] rounded-[12px] p-3 md:p-[16px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon icon="mdi:cash-multiple" className="w-5 h-5 text-[#338078]" />
                                    <p className="font-['Nunito'] font-bold text-lg md:text-[20px] text-[#141522]">
                                        {earnings.currency}{earnings.total_earned.toLocaleString()}
                                    </p>
                                </div>
                                <p className="font-['Poppins'] text-[10px] md:text-[11px] text-gray-500">
                                    Total Earned
                                </p>
                            </div>

                            {/* Pending Payouts */}
                            <div className="flex-1 bg-[#FFF8E8] rounded-[12px] p-3 md:p-[16px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon icon="mdi:clock-outline" className="w-5 h-5 text-[#FFCC00]" />
                                    <p className="font-['Nunito'] font-bold text-lg md:text-[20px] text-[#141522]">
                                        {earnings.currency}{earnings.pending_payouts.toLocaleString()}
                                    </p>
                                </div>
                                <p className="font-['Poppins'] text-[10px] md:text-[11px] text-gray-500">
                                    Pending Payouts
                                </p>
                            </div>
                        </div>

                        {/* View Earnings Link */}
                        <div className="text-right">
                            <Link
                                href={`/admin/teachers/${teacher.id}/earnings`}
                                className="font-['Nunito'] font-medium text-xs md:text-[14px] text-[#338078] hover:underline transition-all inline-flex items-center gap-1"
                            >
                                View Teacher Earnings
                                <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
