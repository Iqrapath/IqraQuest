import { Toaster } from '@/components/ui/sonner';
import { type ReactNode, useEffect } from 'react';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import PageLoadingIndicator from '@/components/PageLoadingIndicator';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

function FlashMessageListener({ initialPage }: { initialPage?: any }) {
    // Handle initial page load
    useEffect(() => {
        if (initialPage?.props?.flash) {
            const flash = initialPage.props.flash;
            if (flash.success) toast.success(flash.success);
            if (flash.error) toast.error(flash.error);
            if (flash.info) toast.info(flash.info);
            if (flash.message) toast.message(flash.message);
        }
    }, [initialPage]);

    // Handle subsequent navigations
    useEffect(() => {
        return router.on('finish', (event) => {
            const page = (event.detail as any).page;
            if (page?.props?.flash) {
                const flash = page.props.flash;
                if (flash.success) toast.success(flash.success);
                if (flash.error) toast.error(flash.error);
                if (flash.info) toast.info(flash.info);
                if (flash.message) toast.message(flash.message);
            }
        });
    }, []);

    return null;
}

export function AppProvider({ children, initialPage }: { children: ReactNode; initialPage?: any }) {
    return (
        <CurrencyProvider>
            <PageLoadingIndicator />
            <FlashMessageListener initialPage={initialPage} />
            {children}
            <Toaster position="top-center" />
        </CurrencyProvider>
    );
}
