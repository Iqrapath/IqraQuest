<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Events\WalletCredited;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class FinancialBackendTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Use the test secret from .env or a dummy one
        Config::set('services.paystack.secret_key', 'sk_test_1234567890abcdef');
    }

    /** @test */
    public function wallet_is_created_automatically_on_registration()
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->wallet);
        $this->assertEquals(0, $user->wallet->balance);
        $this->assertEquals('NGN', $user->wallet->currency);
    }

    /** @test */
    public function student_can_initialize_payment()
    {
        $user = User::factory()->create(['role' => 'student']);
        
        $response = $this->actingAs($user)
            ->postJson('/student/payment/initialize', [
                'amount' => 5000,
                'gateway' => 'paystack'
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'authorization_url', 'reference']);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'amount' => 5000,
            'status' => 'pending',
            'payment_gateway' => 'paystack'
        ]);
    }

    /** @test */
    public function paystack_webhook_credits_wallet_successfully()
    {
        Event::fake([WalletCredited::class]);

        $user = User::factory()->create();
        $reference = 'WAL-TEST-' . uniqid();
        $amount = 5000;

        // 1. Create Pending Transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $user->wallet->id,
            'type' => 'credit',
            'amount' => $amount,
            'currency' => 'NGN',
            'status' => 'pending',
            'payment_gateway' => 'paystack',
            'gateway_reference' => $reference,
            'description' => 'Test Transaction'
        ]);

        // 2. Prepare Webhook Payload
        $payload = [
            'event' => 'charge.success',
            'data' => [
                'reference' => $reference,
                'amount' => $amount * 100, // Kobo
                'status' => 'success',
            ]
        ];

        // 3. Generate Signature
        $signature = hash_hmac('sha512', json_encode($payload), Config::get('services.paystack.secret_key'));

        // 4. Send Webhook Request
        $response = $this->postJson('/webhooks/paystack', $payload, [
            'x-paystack-signature' => $signature
        ]);

        // 5. Verify Results
        $response->assertStatus(200);

        // Transaction should be completed
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'completed'
        ]);

        // Wallet should be credited
        $this->assertDatabaseHas('wallets', [
            'user_id' => $user->id,
            'balance' => 5000
        ]);

        // Event should be broadcasted
        Event::assertDispatched(WalletCredited::class);
    }
}
