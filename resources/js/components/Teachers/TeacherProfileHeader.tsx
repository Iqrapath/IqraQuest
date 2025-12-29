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
    isEarningsPage?: boolean;
}

export default function TeacherProfileHeader({ teacher, earnings, isEarningsPage = false }: TeacherProfileHeaderProps) {
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
            <div className={`relative px-4 md:px-[48px] z-10 ${isEarningsPage ? '-mt-[48px]' : '-mt-[60px] md:-mt-[100px]'}`}>
                <div className={`flex flex-col ${isEarningsPage ? '' : 'xl:flex-row'} items-center xl:items-start justify-between gap-4 md:gap-8`}>
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
                    <div className="bg-white rounded-[24px] shadow-[0px_4px_24px_rgba(0,0,0,0.06)] p-6 w-full md:min-w-[480px] mb-8 md:mb-35 border border-gray-100 freelancers-card">
                        {/* Card Title */}
                        <h2 className="font-['Nunito'] font-bold text-[10px] md:text-[12px] text-gray-400 uppercase tracking-[0.2em] mb-6">
                            Earnings
                        </h2>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            {/* Wallet Balance */}
                            <div className="bg-[#F0F7FF] rounded-[16px] p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    <Icon icon="solar:wallet-2-bold" className="w-5 h-5 text-[#338078]" />
                                </div>
                                <div>
                                    <p className="font-['Nunito'] font-bold text-[10px] text-[#338078] uppercase tracking-wider">
                                        Wallet
                                    </p>
                                    <p className="font-['Nunito'] font-extrabold text-lg text-[#141522]">
                                        {earnings.currency}{earnings.wallet_balance.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Total Earned */}
                            <div className="bg-[#EFFEFD] rounded-[16px] p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    <Icon icon="solar:graph-up-bold" className="w-5 h-5 text-[#338078]" />
                                </div>
                                <div>
                                    <p className="font-['Nunito'] font-bold text-[10px] text-[#338078] uppercase tracking-wider">
                                        Total
                                    </p>
                                    <p className="font-['Nunito'] font-extrabold text-lg text-[#141522]">
                                        {earnings.currency}{earnings.total_earned.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Pending Payouts */}
                            <div className="bg-[#FFF9ED] rounded-[16px] p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    <Icon icon="solar:clock-circle-bold" className="w-5 h-5 text-[#FFCC00]" />
                                </div>
                                <div>
                                    <p className="font-['Nunito'] font-bold text-[10px] text-[#FFCC00] uppercase tracking-wider">
                                        Pending
                                    </p>
                                    <p className="font-['Nunito'] font-extrabold text-lg text-[#141522]">
                                        {earnings.currency}{earnings.pending_payouts.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* View Earnings Link */}
                        <div className="text-right">
                            <Link
                                href={isEarningsPage ? `/admin/teachers/${teacher.id}` : `/admin/teachers/${teacher.id}/earnings`}
                                className="font-['Nunito'] font-bold text-xs text-[#338078] hover:underline transition-all inline-flex items-center gap-1.5"
                            >
                                {isEarningsPage ? 'Go to profile' : 'View Teacher Earnings'}
                                <Icon icon={isEarningsPage ? 'solar:alt-arrow-left-linear' : 'solar:alt-arrow-right-linear'} className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
