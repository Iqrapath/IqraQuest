import { Toaster } from '@/components/ui/sonner';
import { type ReactNode } from 'react';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export function AppProvider({ children }: { children: ReactNode }) {
    return (
        <CurrencyProvider>
            {children}
            <Toaster position="top-right" richColors />
        </CurrencyProvider>
    );
}
