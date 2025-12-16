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
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('commission_rate', 5, 2)->default(15.00)->comment('Platform commission percentage');
            $table->enum('commission_type', ['fixed_percentage', 'fixed_amount'])->default('fixed_percentage');
            
            $table->decimal('auto_payout_threshold', 15, 2)->default(50000.00);
            $table->decimal('min_withdrawal_amount', 15, 2)->default(10000.00);
            
            $table->boolean('bank_verification_enabled')->default(true);
            $table->text('withdrawal_note')->nullable();
            
            $table->string('apply_time')->default('set_now'); // set_now, schedule
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
