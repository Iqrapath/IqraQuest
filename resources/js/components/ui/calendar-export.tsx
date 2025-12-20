import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface CalendarExportProps {
    bookingId: number;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CalendarExport({ 
    bookingId, 
    className,
    variant = 'outline',
    size = 'sm'
}: CalendarExportProps) {
    const baseUrl = window.location.origin;
    const userRole = getUserRole();
    
    const handleGoogleCalendar = async () => {
        try {
            const response = await fetch(`/${userRole}/calendar/google/${bookingId}`);
            const data = await response.json();
            if (data.url) {
                window.open(data.url, '_blank');
            }
        } catch (error) {
            console.error('Failed to generate Google Calendar URL:', error);
        }
    };

    const handleICalDownload = () => {
        window.location.href = `/${userRole}/calendar/export/${bookingId}`;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={cn('gap-2', className)}>
                    <Icon icon="mdi:calendar-export" className="h-4 w-4" />
                    <span className="hidden sm:inline">Add to Calendar</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGoogleCalendar} className="gap-2 cursor-pointer">
                    <Icon icon="flat-color-icons:google" className="h-4 w-4" />
                    Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleICalDownload} className="gap-2 cursor-pointer">
                    <Icon icon="mdi:apple" className="h-4 w-4" />
                    Apple Calendar (iCal)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleICalDownload} className="gap-2 cursor-pointer">
                    <Icon icon="mdi:microsoft-outlook" className="h-4 w-4" />
                    Outlook (iCal)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface ExportAllCalendarProps {
    className?: string;
}

export function ExportAllCalendar({ className }: ExportAllCalendarProps) {
    const userRole = getUserRole();

    const handleExportAll = () => {
        window.location.href = `/${userRole}/calendar/export`;
    };

    return (
        <Button 
            variant="outline" 
            onClick={handleExportAll}
            className={cn('gap-2', className)}
        >
            <Icon icon="mdi:calendar-export" className="h-4 w-4" />
            Export All Sessions
        </Button>
    );
}

function getUserRole(): string {
    const path = window.location.pathname;
    if (path.startsWith('/teacher')) return 'teacher';
    if (path.startsWith('/guardian')) return 'guardian';
    return 'student';
}
