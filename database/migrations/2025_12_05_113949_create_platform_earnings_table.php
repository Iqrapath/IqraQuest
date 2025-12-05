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
        Schema::create('platform_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('booking_id')->nullable(); // Will add foreign key when bookings table exists
            $table->decimal('amount', 15, 2); // Platform commission amount
            $table->decimal('percentage', 5, 2); // Commission percentage (e.g., 15.00)
            $table->timestamps();
            
            // Indexes
            $table->index('transaction_id');
            $table->index('booking_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_earnings');
    }
};
