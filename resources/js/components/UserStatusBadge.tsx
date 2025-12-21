import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface UserStatusBadgeProps {
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    className?: string;
    tooltipContent?: string | null;
}

export default function UserStatusBadge({ status, className = '', tooltipContent }: UserStatusBadgeProps) {
    const config = {
        active: {
            label: 'Active',
            className: 'bg-green-100 text-green-800 border-green-200',
            icon: <Icon icon="bitcoin-icons:verify-outline" />,
            defaultTooltip: 'Account is active and functional',
        },
        inactive: {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: <Icon icon="material-symbols:person-off-outline" />,
            defaultTooltip: 'Account is currently inactive',
        },
        suspended: {
            label: 'Suspended',
            className: 'bg-red-100 text-red-800 border-red-200',
            icon: <Icon icon="lsicon:suspend-outline" />,
            defaultTooltip: 'Account suspended - contact admin for details',
        },
        pending: {
            label: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: '⏳',
            defaultTooltip: 'Account is awaiting verification or setup',
        },
    };

    const currentStatus = status?.toLowerCase() as keyof typeof config;
    const { label, className: badgeClass, icon, defaultTooltip } = config[currentStatus] || config.pending;
    const tooltip = tooltipContent || defaultTooltip;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-full text-xs font-medium border cursor-help lg:text-sm",
                            badgeClass,
                            className
                        )}
                    >
                        <span className="shrink-0">{icon}</span>
                        <span className="font-['Poppins']">{label}</span>
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] z-[100]">
                    <p className="text-sm font-['Nunito']">{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
