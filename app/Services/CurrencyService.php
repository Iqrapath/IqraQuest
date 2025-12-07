<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CurrencyService
{

    /**
     * Convert amount from one currency to another
     */
    public function convert(float $amount, string $fromCurrency, string $toCurrency): float
    {
        if ($fromCurrency === $toCurrency) {
            return $amount;
        }

        $rate = $this->getExchangeRate($fromCurrency, $toCurrency);
        
        // Simple conversion without Money package
        // Round to 2 decimal places
        return round($amount * $rate, 2);
    }

    /**
     * Get exchange rate from cache or API
     */
    public function getExchangeRate(string $from, string $to): float
    {
        $cacheKey = "exchange_rate_{$from}_{$to}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($from, $to) {
            return $this->fetchExchangeRate($from, $to);
        });
    }

    /**
     * Fetch exchange rate from API
     */
    protected function fetchExchangeRate(string $from, string $to): float
    {
        try {
            // Use same API as frontend for consistency (https://open.er-api.com/v6/latest/USD)
            $response = Http::timeout(5)->get("https://open.er-api.com/v6/latest/USD");

            if ($response->successful()) {
                $rates = $response->json()['rates'];
                
                // If we have both rates (relative to USD)
                if (isset($rates[$from]) && isset($rates[$to])) {
                    // Calculate cross rate
                    // Formula: Rate(From->To) = Rate(USD->To) / Rate(USD->From)
                    $rate = $rates[$to] / $rates[$from];

                    Log::info('Exchange rate fetched successfully', [
                        'from' => $from,
                        'to' => $to,
                        'rate' => $rate,
                    ]);

                    return (float) $rate;
                }
            }

            // Fallback to default rates if API fails
            return $this->getFallbackRate($from, $to);
        } catch (\Exception $e) {
            Log::error('Failed to fetch exchange rate', [
                'from' => $from,
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return $this->getFallbackRate($from, $to);
        }
    }

    /**
     * Get fallback exchange rates (updated manually)
     */
    protected function getFallbackRate(string $from, string $to): float
    {
        $fallbackRates = [
            'NGN' => [
                'USD' => 0.00065,  // 1 NGN = ~0.00065 USD (₦1,538 = $1)
                'EUR' => 0.00060,
                'GBP' => 0.00051,
            ],
            'USD' => [
                'NGN' => 1538.00,
                'EUR' => 0.92,
                'GBP' => 0.79,
            ],
        ];

        if (isset($fallbackRates[$from][$to])) {
            Log::warning('Using fallback exchange rate', [
                'from' => $from,
                'to' => $to,
                'rate' => $fallbackRates[$from][$to],
            ]);

            return $fallbackRates[$from][$to];
        }

        // Default to 1:1 if no rate found
        Log::error('No exchange rate found, defaulting to 1:1', [
            'from' => $from,
            'to' => $to,
        ]);

        return 1.0;
    }

    /**
     * Format money with currency symbol
     */
    public function format(float $amount, string $currency): string
    {
        $symbols = [
            'NGN' => '₦',
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
        ];

        $symbol = $symbols[$currency] ?? $currency;

        return $symbol . number_format($amount, 2);
    }

    /**
     * Clear exchange rate cache
     */
    public function clearCache(): void
    {
        Cache::forget('exchange_rate_*');
    }
}
