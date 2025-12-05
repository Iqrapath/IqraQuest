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
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('status', ['pending', 'approved', 'processing', 'completed', 'failed', 'rejected', 'cancelled'])->default('pending');
            
            // Payment method
            $table->foreignId('payment_method_id')->nullable()->constrained('teacher_payment_methods')->onDelete('set null');
            $table->string('gateway')->nullable(); // paystack, paypal
            $table->string('gateway_reference')->nullable(); // Transaction ID from gateway
            $table->json('gateway_response')->nullable(); // Full response from gateway
            
            // Approval workflow
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('teacher_id');
            $table->index('status');
            $table->index('gateway');
            $table->index('gateway_reference');
            $table->index('approved_by');
            $table->index('requested_at');
            
            // Composite Indexes
            $table->index(['teacher_id', 'status']);
            $table->index(['status', 'requested_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};
