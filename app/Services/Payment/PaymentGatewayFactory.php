<?php

namespace App\Services\Payment;

use App\Services\Payment\PaystackService;
use App\Services\Payment\PayPalService;

class PaymentGatewayFactory
{
    /**
     * Create a payment gateway instance
     */
    public static function make(string $gateway): PaystackService|PayPalService
    {
        return match(strtolower($gateway)) {
            'paystack' => app(PaystackService::class),
            'paypal' => app(PayPalService::class),
            default => throw new \InvalidArgumentException("Unsupported payment gateway: {$gateway}"),
        };
    }

    /**
     * Get default gateway
     */
    public static function default(): PaystackService
    {
        return app(PaystackService::class);
    }

    /**
     * Get available gateways
     */
    public static function available(): array
    {
        return [
            'paystack' => [
                'name' => 'Paystack',
                'supports' => ['cards', 'bank_transfer', 'bank_account'],
                'enabled' => !empty(config('services.paystack.secret_key')),
            ],
            'paypal' => [
                'name' => 'PayPal',
                'supports' => ['paypal_account'],
                'enabled' => !empty(config('services.paypal.client_id')),
            ],
        ];
    }

    /**
     * Check if a gateway is enabled
     */
    public static function isEnabled(string $gateway): bool
    {
        $available = self::available();
        return $available[$gateway]['enabled'] ?? false;
    }
}
