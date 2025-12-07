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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('wallet_id')->nullable()->constrained()->onDelete('set null');
            
            // Transaction details
            $table->enum('type', ['credit', 'debit', 'booking_payment', 'payout', 'refund', 'commission']);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            
            // Payment gateway info
            $table->string('payment_gateway')->nullable(); // paystack, paypal, null
            $table->string('gateway_reference')->nullable(); // Gateway transaction ID
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // booking_id, teacher_id, etc.
            
            // Polymorphic relationship to various transactionables (Booking, Payout, etc.)
            $table->nullableMorphs('transactionable');
            
            $table->timestamps();
            

            // Indexes
            $table->index('user_id');
            $table->index('wallet_id');
            $table->index('type');
            $table->index('status');
            $table->index('payment_gateway');
            $table->index('gateway_reference');
            $table->index('created_at');
            
            // Composite Indexes for Performance
            $table->index(['user_id', 'created_at']);
            $table->index(['payment_gateway', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
