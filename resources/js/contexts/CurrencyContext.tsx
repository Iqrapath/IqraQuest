import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'NGN' | 'USD';

interface CurrencyConfig {
    symbol: string;
    label: string;
}

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
    NGN: {
        symbol: '₦',
        label: 'Naira'
    },
    USD: {
        symbol: '$',
        label: 'Dollar'
    }
};

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    config: CurrencyConfig;
    formatAmount: (amount: number) => string;
    convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
    rates: Record<string, number>;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children, initialCurrency = 'NGN' }: { children: ReactNode, initialCurrency?: CurrencyCode }) {
    const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const config = CURRENCY_CONFIG[currency];

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Use Laravel API instead of external API
                const response = await fetch('/api/currency/rates');
                const data = await response.json();
                setRates(data.rates);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch exchange rates:', error);
                // Fallback rates if API fails
                setRates({
                    USD: 1,
                    NGN: 1538,
                    EUR: 0.92,
                    GBP: 0.79
                });
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    useEffect(() => {
        if (initialCurrency) {
            setCurrency(initialCurrency);
        }
    }, [initialCurrency]);

    const formatAmount = (amount: number) => {
        return `${config.symbol}${new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount)}`;
    };

    const convert = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
        if (from === to) return amount;
        if (!rates[from] || !rates[to]) return amount; // Fallback if rates not loaded

        // Convert 'from' to USD (base), then USD to 'to'
        // Since base is USD:
        // amount / rates[from] = amount in USD
        // amount in USD * rates[to] = amount in 'to'

        const amountInUSD = amount / rates[from];
        return amountInUSD * rates[to];
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, config, formatAmount, convert, rates, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
