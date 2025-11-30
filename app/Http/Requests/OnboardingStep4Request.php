<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class OnboardingStep4Request extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === UserRole::TEACHER;
    }

    public function rules(): array
    {
        return [
            'preferred_currency' => ['required', 'string', 'in:NGN,USD'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'payment_type' => ['required', 'string', 'in:bank_transfer,paypal,stripe,paystack'],
            
            // Bank Transfer & Paystack validation
            'bank_name' => ['required_if:payment_type,bank_transfer,paystack', 'nullable', 'string', 'max:255'],
            'bank_code' => ['required_if:payment_type,paystack', 'nullable', 'string', 'max:50'],
            'account_number' => ['required_if:payment_type,bank_transfer,paystack', 'nullable', 'string', 'max:100'],
            'account_name' => ['required_if:payment_type,bank_transfer,paystack', 'nullable', 'string', 'max:255'],
            'routing_number' => ['nullable', 'string', 'max:50'],
            
            // PayPal validation
            'paypal_email' => ['required_if:payment_type,paypal', 'nullable', 'email', 'max:255'],
            
            // Stripe validation
            'stripe_account_id' => ['required_if:payment_type,stripe', 'nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $data = $validator->getData();
            $currency = $data['preferred_currency'] ?? null;
            $rate = $data['hourly_rate'] ?? null;

            if ($currency === 'NGN') {
                if ($rate < 3000 || $rate > 5000) {
                    $validator->errors()->add('hourly_rate', 'Hourly rate for Naira must be between 3000 and 5000.');
                }
            } elseif ($currency === 'USD') {
                // Fetch exchange rate (USD base)
                $rates = \Illuminate\Support\Facades\Cache::remember('exchange_rates_usd', 86400, function () {
                    try {
                        $response = \Illuminate\Support\Facades\Http::get('https://open.er-api.com/v6/latest/USD');
                        return $response->json()['rates'] ?? [];
                    } catch (\Exception $e) {
                        return [];
                    }
                });

                $ngnRate = $rates['NGN'] ?? 1500; // Fallback if API fails

                // Convert USD input to NGN
                $amountInNGN = $rate * $ngnRate;

                if ($amountInNGN < 3000 || $amountInNGN > 5000) {
                    // Calculate USD limits for error message
                    $minUsd = number_format(3000 / $ngnRate, 2);
                    $maxUsd = number_format(5000 / $ngnRate, 2);
                    $validator->errors()->add('hourly_rate', "Hourly rate for Dollar must be between \${$minUsd} and \${$maxUsd} (equivalent to ₦3000 - ₦5000).");
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'preferred_currency.required' => 'Please select your preferred currency.',
            'hourly_rate.required' => 'Please enter your hourly rate.',
            'hourly_rate.min' => 'Hourly rate must be at least 0.',
            'payment_type.required' => 'Please select a payment method.',
            'bank_name.required_if' => 'Bank name is required for bank transfer.',
            'account_number.required_if' => 'Account number is required for bank transfer.',
            'account_name.required_if' => 'Account name is required for bank transfer.',
            'paypal_email.required_if' => 'PayPal email is required for PayPal payments.',
            'stripe_account_id.required_if' => 'Stripe account ID is required for Stripe payments.',
        ];
    }
}
