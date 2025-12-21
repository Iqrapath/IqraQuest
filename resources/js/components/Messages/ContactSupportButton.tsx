import { router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ContactSupportButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    baseUrl: string;
    onSuccess?: () => void;
}

export default function ContactSupportButton({
    className,
    variant = 'default',
    size = 'md',
    baseUrl,
    onSuccess,
}: ContactSupportButtonProps) {
    const handleClick = () => {
        router.post(`${baseUrl}/support`, {}, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                onSuccess?.();
            },
        });
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-[10px] gap-1.5',
        md: 'px-4 py-2 text-[12px] gap-2',
        lg: 'px-6 py-3 text-[14px] gap-2.5',
    };

    const variantClasses = {
        default: 'bg-[#338078] text-white hover:bg-[#2a6b64]',
        outline: 'border border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white',
        ghost: 'text-[#338078] hover:bg-[#338078]/10',
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "inline-flex items-center justify-center rounded-full font-['Nunito'] font-medium transition-colors",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
        >
            <Icon icon="mdi:headset" className={cn(
                size === 'sm' && 'w-3 h-3',
                size === 'md' && 'w-4 h-4',
                size === 'lg' && 'w-5 h-5',
            )} />
            <span>Contact Support</span>
        </button>
    );
}
