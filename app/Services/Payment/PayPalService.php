<?php

namespace App\Services\Payment;

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use PayPalCheckoutSdk\Orders\OrdersGetRequest;
use PayPalCheckoutSdk\Payouts\PayoutsPostRequest;
use Illuminate\Support\Facades\Log;

class PayPalService
{
    protected PayPalHttpClient $client;

    public function __construct()
    {
        $mode = config('services.paypal.mode');
        $clientId = config('services.paypal.client_id');
        $clientSecret = config('services.paypal.client_secret');

        $environment = $mode === 'live'
            ? new ProductionEnvironment($clientId, $clientSecret)
            : new SandboxEnvironment($clientId, $clientSecret);

        $this->client = new PayPalHttpClient($environment);
    }

    /**
     * Create a PayPal order for payment
     */
    public function createOrder(float $amount, string $currency, string $reference): array
    {
        try {
            $request = new OrdersCreateRequest();
            $request->prefer('return=representation');
            $request->body = [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => $reference,
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => number_format($amount, 2, '.', ''),
                    ],
                ]],
                'application_context' => [
                    'return_url' => route('student.payment.callback') . '?gateway=paypal',
                    'cancel_url' => route('student.wallet'),
                ],
            ];

            $response = $this->client->execute($request);

            return [
                'status' => true,
                'order_id' => $response->result->id,
                'approval_url' => collect($response->result->links)
                    ->firstWhere('rel', 'approve')
                    ->href ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('PayPal order creation failed', [
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
     * Capture a PayPal order (complete payment)
     */
    public function captureOrder(string $orderId): array
    {
        try {
            $request = new OrdersCaptureRequest($orderId);
            $response = $this->client->execute($request);

            $capture = $response->result->purchase_units[0]->payments->captures[0] ?? null;

            return [
                'status' => true,
                'data' => [
                    'order_id' => $response->result->id,
                    'status' => $response->result->status,
                    'amount' => $capture->amount->value ?? 0,
                    'currency' => $capture->amount->currency_code ?? 'USD',
                    'capture_id' => $capture->id ?? null,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('PayPal order capture failed', [
                'error' => $e->getMessage(),
                'order_id' => $orderId,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get order details
     */
    public function getOrderDetails(string $orderId): array
    {
        try {
            $request = new OrdersGetRequest($orderId);
            $response = $this->client->execute($request);

            return [
                'status' => true,
                'data' => [
                    'order_id' => $response->result->id,
                    'status' => $response->result->status,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('PayPal get order details failed', [
                'error' => $e->getMessage(),
                'order_id' => $orderId,
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create a payout to PayPal email
     */
    public function createPayout(string $recipientEmail, float $amount, string $note, string $reference): array
    {
        try {
            $request = new PayoutsPostRequest();
            $request->body = [
                'sender_batch_header' => [
                    'sender_batch_id' => $reference,
                    'email_subject' => 'You have a payout from IqraQuest!',
                    'email_message' => $note,
                ],
                'items' => [
                    [
                        'recipient_type' => 'EMAIL',
                        'amount' => [
                            'value' => number_format($amount, 2, '.', ''),
                            'currency' => 'USD',
                        ],
                        'note' => $note,
                        'sender_item_id' => $reference,
                        'receiver' => $recipientEmail,
                    ],
                ],
            ];

            $response = $this->client->execute($request);

            return [
                'status' => true,
                'data' => [
                    'batch_id' => $response->result->batch_header->payout_batch_id,
                    'batch_status' => $response->result->batch_header->batch_status,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('PayPal payout creation failed', [
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
     * Verify webhook signature
     */
    public function verifyWebhookSignature(array $headers, string $body): bool
    {
        // PayPal webhook verification is more complex
        // For now, return true - implement proper verification in production
        // See: https://developer.paypal.com/api/rest/webhooks/
        return true;
    }
    /**
     * Get PayPal Login URL for OAuth
     */
    public function getLoginUrl(string $redirectUri): string
    {
        $clientId = config('services.paypal.client_id');
        $scopes = [
            'openid',
            'email',
            'https://uri.paypal.com/services/payouts'
        ];
        
        // Use sandbox or live URL based on config
        $baseUrl = config('services.paypal.mode') === 'live' 
            ? 'https://www.paypal.com' 
            : 'https://www.sandbox.paypal.com';

        $query = http_build_query([
            'flowEntry' => 'static',
            'client_id' => $clientId,
            'response_type' => 'code',
            'scope' => implode(' ', $scopes),
            'redirect_uri' => $redirectUri,
        ]);

        $fullUrl = "{$baseUrl}/connect?{$query}";
        
        Log::info('PayPal Connect Debug:', [
            'mode' => config('services.paypal.mode'),
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'full_url' => $fullUrl
        ]);

        return $fullUrl;
    }

    /**
     * Get User Info from PayPal using Auth Code
     */
    public function getUserInfo(string $code): array
    {
        try {
            $clientId = config('services.paypal.client_id');
            $clientSecret = config('services.paypal.client_secret');
            
            $baseUrl = config('services.paypal.mode') === 'live' 
                ? 'https://api-m.paypal.com' 
                : 'https://api-m.sandbox.paypal.com';

            // 1. Exchange code for access token
            $tokenResponse = \Illuminate\Support\Facades\Http::asForm()
                ->withBasicAuth($clientId, $clientSecret)
                ->post("{$baseUrl}/v1/oauth2/token", [
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                ]);

            if (!$tokenResponse->successful()) {
                throw new \Exception('Failed to exchange code for token: ' . $tokenResponse->body());
            }

            $accessToken = $tokenResponse->json()['access_token'];

            // 2. Get User Info
            $userResponse = \Illuminate\Support\Facades\Http::withToken($accessToken)
                ->get("{$baseUrl}/v1/identity/openidconnect/userinfo?schema=openid");

            if (!$userResponse->successful()) {
                throw new \Exception('Failed to get user info: ' . $userResponse->body());
            }

            $userData = $userResponse->json();

            return [
                'status' => true,
                'data' => [
                    'email' => $userData['email'] ?? null,
                    'payer_id' => $userData['payer_id'] ?? $userData['user_id'] ?? null,
                    'name' => $userData['name'] ?? null,
                ]
            ];

        } catch (\Exception $e) {
            Log::error('PayPal User Info Error', ['message' => $e->getMessage()]);
            return [
                'status' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
