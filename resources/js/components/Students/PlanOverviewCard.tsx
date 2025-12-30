import React from 'react';

interface Plan {
    name: string;
    price: string;
    start_date: string;
    end_date: string;
    billing: string;
    status: string;
}

interface Props {
    plan?: Plan;
}

export default function PlanOverviewCard({ plan }: Props) {
    if (!plan) return null;

    return (
        <div className="bg-white rounded-[16px] p-6 mb-8 border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="text-[#101928] text-xl font-bold font-['Nunito'] mb-6">Plan Overview</h2>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="text-[#667085] text-sm md:w-[150px] font-medium font-['Nunito']">Enrolled Plan:</span>
                    <span className="text-[#101928] font-semibold font-['Nunito']">
                        {plan.name} – {plan.price}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="text-[#667085] text-sm md:w-[150px] font-medium font-['Nunito']">Start Date:</span>
                    <span className="text-[#101928] font-medium font-['Nunito']">{plan.start_date}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="text-[#667085] text-sm md:w-[150px] font-medium font-['Nunito']">End Date:</span>
                    <span className="text-[#101928] font-medium font-['Nunito']">{plan.end_date}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="text-[#667085] text-sm md:w-[150px] font-medium font-['Nunito']">Billing:</span>
                    <span className="text-[#101928] font-medium font-['Nunito']">{plan.billing}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="text-[#667085] text-sm md:w-[150px] font-medium font-['Nunito']">Status:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#17B26A] flex items-center justify-center">
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 1L3.5 6.5L1 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-[#17B26A] font-semibold font-['Nunito']">{plan.status}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
                <button className="bg-[#338078] hover:bg-[#2A6B64] text-white px-6 py-2 rounded-full text-sm font-bold font-['Nunito'] transition-colors shadow-sm">
                    Upgrade Plan
                </button>
                <button className="text-[#338078] hover:text-[#2A6B64] text-sm font-bold font-['Nunito'] transition-colors">
                    Renew Plan
                </button>
                <button className="text-[#D92D20] hover:text-[#B42318] text-sm font-bold font-['Nunito'] transition-colors">
                    Cancel Subscription
                </button>

                <div className="flex-1 text-right">
                    <button className="text-[#98A2B3] hover:text-[#667085] text-sm font-medium font-['Nunito']">
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}
