<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('guardian_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guardian_id')->constrained('guardians')->onDelete('cascade');
            $table->enum('type', ['card', 'bank_account', 'paypal', 'mobile_wallet']);
            $table->string('gateway'); // paystack, paypal
            $table->boolean('is_primary')->default(false);
            
            // For Cards (Paystack)
            $table->string('card_authorization_code')->nullable(); // From Paystack
            $table->string('card_last4')->nullable();
            $table->string('card_brand')->nullable(); // visa, mastercard, verve
            $table->string('card_exp_month')->nullable();
            $table->string('card_exp_year')->nullable();
            
            // For Bank Accounts (Paystack Direct Debit)
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->string('bank_code')->nullable();
            
            // For PayPal
            $table->string('paypal_email')->nullable();
            
            // For Mobile Wallets (MTN, Airtel, etc.)
            $table->string('wallet_provider')->nullable(); // mtn, airtel, vodafone, etc.
            $table->string('wallet_phone_number')->nullable();
            $table->string('wallet_account_name')->nullable();
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('guardian_id');
            $table->index('type');
            $table->index('is_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guardian_payment_methods');
    }
};
