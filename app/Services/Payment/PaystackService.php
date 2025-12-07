<?php

namespace App\Services\Payment;

use Yabacon\Paystack;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected Paystack $paystack;
    protected string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->paystack = new Paystack($this->secretKey);
    }

    /**
     * Initialize a payment transaction
     */
    public function initializePayment(string $email, float $amount, string $reference, array $metadata = [], array $channels = ['card'], string $currency = 'NGN', ?string $callbackUrl = null): array
    {
        try {
            $tranx = $this->paystack->transaction->initialize([
                'email' => $email,
                'amount' => (int) ($amount * 100), // Convert to kobo and cast to int
                'reference' => $reference,
                'metadata' => $metadata,
                'channels' => $channels,
                'currency' => $currency,
                'callback_url' => ($callbackUrl ?? route('student.payment.callback')) . '?gateway=paystack&reference=' . $reference,
            ]);

            return [
                'status' => true,
                'authorization_url' => $tranx->data->authorization_url,
                'access_code' => $tranx->data->access_code,
                'reference' => $tranx->data->reference,
            ];
        } catch (\Exception $e) {
            Log::error('Paystack card payment initialization failed', [
                'error' => $e->getMessage(),
                'reference' => $reference,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify a payment transaction
     */
    public function verifyPayment(string $reference): array
    {
        try {
            $tranx = $this->paystack->transaction->verify([
                'reference' => $reference,
            ]);

            return [
                'status' => true,
                'data' => [
                    'reference' => $tranx->data->reference,
                    'amount' => $tranx->data->amount / 100, // Convert from kobo
                    'status' => $tranx->data->status,
                    'paid_at' => $tranx->data->paid_at,
                    'gateway_response' => $tranx->data->gateway_response,
                    'authorization' => $tranx->data->authorization ?? null,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack payment verification failed', [
                'error' => $e->getMessage(),
                'reference' => $reference,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create a dedicated virtual account
     */
    public function createVirtualAccount(string $email, string $firstName, string $lastName, string $reference): array
    {
        try {
            $response = $this->paystack->dedicatedAccount->create([
                'email' => $email,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'preferred_bank' => 'wema-bank',
            ]);

            return [
                'status' => true,
                'data' => [
                    'account_number' => $response->data->account_number,
                    'account_name' => $response->data->account_name,
                    'bank_name' => $response->data->bank->name,
                    'bank_code' => $response->data->bank->slug,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack virtual account creation failed', [
                'error' => $e->getMessage(),
                'email' => $email,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Charge an authorized card
     */
    public function chargeAuthorization(string $authorizationCode, string $email, float $amount, string $reference): array
    {
        try {
            $tranx = $this->paystack->transaction->chargeAuthorization([
                'authorization_code' => $authorizationCode,
                'email' => $email,
                'amount' => $amount * 100,
                'reference' => $reference,
            ]);

            return [
                'status' => true,
                'data' => [
                    'reference' => $tranx->data->reference,
                    'amount' => $tranx->data->amount / 100,
                    'status' => $tranx->data->status,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack charge authorization failed', [
                'error' => $e->getMessage(),
                'reference' => $reference,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify a bank account
     */
    public function verifyBankAccount(string $accountNumber, string $bankCode): array
    {
        try {
            $response = $this->paystack->bank->resolve([
                'account_number' => $accountNumber,
                'bank_code' => $bankCode,
            ]);

            return [
                'status' => true,
                'data' => [
                    'account_number' => $response->data->account_number,
                    'account_name' => $response->data->account_name,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack bank verification failed', [
                'error' => $e->getMessage(),
                'account_number' => $accountNumber,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create a transfer recipient
     */
    public function createTransferRecipient(string $accountName, string $accountNumber, string $bankCode): array
    {
        try {
            $response = $this->paystack->transferrecipient->create([
                'type' => 'nuban',
                'name' => $accountName,
                'account_number' => $accountNumber,
                'bank_code' => $bankCode,
                'currency' => 'NGN',
            ]);

            return [
                'status' => true,
                'data' => [
                    'recipient_code' => $response->data->recipient_code,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack transfer recipient creation failed', [
                'error' => $e->getMessage(),
                'account_number' => $accountNumber,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Transfer funds to a bank account
     */
    public function transferToBank(string $recipientCode, float $amount, string $reason, string $reference): array
    {
        try {
            $response = $this->paystack->transfer->initiate([
                'source' => 'balance',
                'reason' => $reason,
                'amount' => $amount * 100,
                'recipient' => $recipientCode,
                'reference' => $reference,
            ]);

            return [
                'status' => true,
                'data' => [
                    'transfer_code' => $response->data->transfer_code,
                    'reference' => $response->data->reference,
                    'status' => $response->data->status,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack transfer failed', [
                'error' => $e->getMessage(),
                'reference' => $reference,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get list of Nigerian banks
     */
    public function getBanks(): array
    {
        try {
            $response = $this->paystack->bank->list();

            return [
                'status' => true,
                'data' => collect($response->data)->map(fn($bank) => [
                    'name' => $bank->name,
                    'code' => $bank->code,
                    'slug' => $bank->slug,
                ])->toArray(),
            ];
        } catch (\Exception $e) {
            Log::error('Paystack get banks failed', [
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $signature, string $input): bool
    {
        return $signature === hash_hmac('sha512', $input, $this->secretKey);
    }

    /**
     * Get transaction status
     */
    public function getTransactionStatus(string $reference): ?string
    {
        $result = $this->verifyPayment($reference);
        
        return $result['status'] ? ($result['data']['status'] ?? null) : null;
    }
}
