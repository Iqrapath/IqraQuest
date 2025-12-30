import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface RevenueChartProps {
    data: { label: string; total: string | number }[];
    currentFilter: string;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 shadow-[0px_8px_32px_rgba(0,0,0,0.1)] rounded-[20px] border border-white/20 flex flex-col gap-1.5 min-w-[150px]">
                <p className="text-[#667085] text-xs font-['Nunito'] font-medium">{label}, 2025</p>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2D7D72]"></div>
                    <p className="text-[#101928] font-bold text-lg font-['Nunito']">
                        ₦{Number(payload[0].value).toLocaleString()}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

// Custom Active Dot
const CustomActiveDot = (props: any) => {
    const { cx, cy } = props;
    return (
        <svg x={cx - 12} y={cy - 12} width={24} height={24} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.8" />
            <circle cx="12" cy="12" r="6" fill="#2D7D72" stroke="white" strokeWidth="2" />
        </svg>
    );
};

// Skeleton Loader Component
const RevenueChartSkeleton = () => (
    <div className="bg-white border-[0.804px] border-[rgba(0,0,0,0.1)] flex flex-col px-[38.5px] py-[25.7px] rounded-[19.3px] size-full h-full min-h-[400px] animate-pulse">
        <div className="flex items-center justify-between w-full mb-[25.7px]">
            <div className="h-7 w-48 bg-gray-100 rounded-lg"></div>
            <div className="h-8 w-28 bg-gray-100 rounded-md"></div>
        </div>
        <div className="flex-1 w-full flex items-end gap-4 mt-8">
            <div className="w-full h-full bg-gray-50/50 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between py-8 px-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-px w-full bg-gray-100"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default function RevenueChart({ data, currentFilter }: RevenueChartProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const startHandler = () => setIsLoading(true);
        const finishHandler = () => setIsLoading(false);

        router.on('start', startHandler);
        router.on('finish', finishHandler);

        return () => {
            // No need to manually remove listeners in newer Inertia versions if they return an unlisten function, 
            // but for safety in this env we check if it supports it.
        };
    }, []);

    const handleFilterChange = (value: string) => {
        router.get(
            '/admin/dashboard',
            { time_range: value },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['revenue_data', 'current_filter']
            }
        );
    };

    const formatYAxis = (value: number) => {
        if (value >= 1000) return `${value / 1000}K`;
        return value.toString();
    };

    if (isLoading) return <RevenueChartSkeleton />;

    const totalRevenue = data.reduce((acc, curr) => acc + Number(curr.total), 0);

    return (
        <div className="bg-white border-[0.804px] border-[rgba(0,0,0,0.1)] flex flex-col px-[38.5px] py-[25.7px] relative rounded-[19.3px] size-full h-full min-h-[400px] shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
            <div className="flex items-center justify-between w-full mb-[20px]">
                <div className="flex flex-col gap-1">
                    <h2 className="font-['Nunito'] font-bold text-[20px] text-[#101928]">Revenue Summary</h2>
                    <p className="text-[#667085] text-sm font-medium">Total: <span className="text-[#2D7D72] font-bold">₦{totalRevenue.toLocaleString()}</span></p>
                </div>

                <Select value={currentFilter} onValueChange={handleFilterChange}>
                    <SelectTrigger className="bg-[#F9FAFB] border-gray-200 flex items-center justify-between px-3 py-2 w-[130px] h-[36px] rounded-lg focus:ring-2 focus:ring-[#2D7D72]/20 transition-all hover:bg-gray-100">
                        <span className="text-[#475467] text-sm font-semibold">
                            <SelectValue placeholder="Period" />
                        </span>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-100 shadow-2xl rounded-xl">
                        <SelectItem value="this_year">This Year</SelectItem>
                        <SelectItem value="last_12_months">Last 12 Mon</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 w-full min-h-[300px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                    >
                        <defs>
                            <filter id="shadow" height="200%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                <feOffset dx="0" dy="4" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.3" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="4 4"
                            stroke="#F2F4F7"
                        />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#667085', fontSize: 12, fontWeight: 500, fontFamily: 'Nunito' }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#98A2B3', fontSize: 12, fontFamily: 'Nunito' }}
                            tickFormatter={formatYAxis}
                            dx={-10}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#F2F4F7', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#E7D9B6"
                            strokeWidth={4}
                            dot={false}
                            activeDot={<CustomActiveDot />}
                            filter="url(#shadow)"
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
