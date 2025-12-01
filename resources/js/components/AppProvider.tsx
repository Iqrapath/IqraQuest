import { Toaster } from '@/components/ui/sonner';
import { type ReactNode } from 'react';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import PageLoadingIndicator from '@/components/PageLoadingIndicator';

export function AppProvider({ children }: { children: ReactNode }) {
    return (
        <CurrencyProvider>
            <PageLoadingIndicator />
            {children}
            <Toaster position="top-right" richColors />
        </CurrencyProvider>
    );
}
