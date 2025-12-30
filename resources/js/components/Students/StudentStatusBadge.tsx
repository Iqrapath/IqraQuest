import { Icon } from '@iconify/react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type StudentStatus = 'pending' | 'active' | 'suspended' | 'rejected' | 'under_review' | 'approved';

interface StudentStatusBadgeProps {
    status: StudentStatus;
    showIcon?: boolean;
    className?: string;
    tooltipContent?: string;
}

export default function StudentStatusBadge({
    status,
    showIcon = true,
    className = "",
    tooltipContent
}: StudentStatusBadgeProps) {

    // Define styles and icons based on status
    const statusConfig: Record<StudentStatus, {
        bg: string,
        text: string,
        icon: string,
        label: string
    }> = {
        pending: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            icon: 'solar:clock-circle-bold',
            label: 'Pending'
        },
        under_review: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            icon: 'solar:eye-bold',
            label: 'Under Review'
        },
        approved: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            icon: 'solar:verified-check-bold',
            label: 'Approved'
        },
        active: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            icon: 'solar:check-circle-bold',
            label: 'Active'
        },
        suspended: {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            icon: 'solar:forbidden-circle-bold',
            label: 'Suspended'
        },
        rejected: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            icon: 'solar:close-circle-bold',
            label: 'Rejected'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;

    const badge = (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-['Nunito'] transition-all ${config.bg} ${config.text} ${className}`}>
            {showIcon && <Icon icon={config.icon} className="w-4 h-4" />}
            {config.label}
        </span>
    );

    if (tooltipContent) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="cursor-help">
                            {badge}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-gray-100 shadow-xl p-3 rounded-xl max-w-xs">
                        <p className="text-gray-700 text-sm font-['Nunito'] leading-relaxed">
                            {tooltipContent}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return badge;
}
