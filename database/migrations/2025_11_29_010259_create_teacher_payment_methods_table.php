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
        Schema::create('teacher_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            
            // Payment method type
            $table->enum('payment_type', ['bank_transfer', 'paypal', 'stripe', 'flutterwave', 'paystack']);
            
            // Is this the primary/default method?
            $table->boolean('is_primary')->default(false);
            
            // Bank details (for bank_transfer)
            $table->string('bank_name')->nullable();
            $table->string('account_number', 100)->nullable();
            $table->string('account_name')->nullable();
            $table->string('bank_code', 50)->nullable();
            $table->string('routing_number', 50)->nullable();
            
            // Online payment details (for paypal, stripe, etc)
            $table->string('email')->nullable();
            $table->string('account_id')->nullable();
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('teacher_id');
            $table->index('is_primary');
            $table->index('payment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_payment_methods');
    }
};
