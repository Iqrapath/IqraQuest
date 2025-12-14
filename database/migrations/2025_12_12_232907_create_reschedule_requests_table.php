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
        Schema::create('reschedule_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade'); // Who asked for it
            
            $table->dateTime('original_start_time');
            $table->dateTime('new_start_time');
            $table->dateTime('new_end_time');
            
            $table->text('reason')->nullable();
            
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'expired'
            ])->default('pending');
            
            $table->timestamp('expires_at')->nullable(); // Auto-reject if not answered
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reschedule_requests');
    }
};
