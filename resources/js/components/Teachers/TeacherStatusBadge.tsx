import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TeacherStatusBadgeProps {
    status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected' | 'under_review';
    className?: string;
    tooltipContent?: string | null;
}

export default function TeacherStatusBadge({ status, className = '', tooltipContent }: TeacherStatusBadgeProps) {
    const config = {
        pending: {
            label: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: '⏳',
            defaultTooltip: 'Awaiting admin approval',
        },
        approved: {
            label: 'Approved',
            className: 'bg-green-100 text-green-800 border-green-200',
            icon: '✓',
            defaultTooltip: 'Teacher account approved',
        },
        active: {
            label: 'Active',
            className: 'bg-green-100 text-green-800 border-green-200',
            icon: '✓',
            defaultTooltip: 'Teacher is currently active',
        },
        suspended: {
            label: 'Suspended',
            className: 'bg-red-100 text-red-800 border-red-200',
            icon: '⊘',
            defaultTooltip: 'Account suspended - contact admin for details',
        },
        rejected: {
            label: 'Rejected',
            className: 'bg-red-100 text-red-800 border-red-200',
            icon: '✕',
            defaultTooltip: 'Application rejected',
        },
        under_review: {
            label: 'Under Review',
            className: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: '👁',
            defaultTooltip: 'Application under review',
        },
    };

    const { label, className: badgeClass, icon, defaultTooltip } = config[status] || config.pending;
    const tooltip = tooltipContent || defaultTooltip;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-help ${badgeClass} ${className}`}
                    >
                        <span>{icon}</span>
                        <span className="font-['Poppins']">{label}</span>
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                    <p className="text-sm font-['Nunito']">{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
