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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Student, Guardian
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            
            $table->enum('status', [
                'pending',      // Created but not paid/confirmed
                'awaiting_approval', // Paid, waiting for teacher
                'confirmed',    // Paid and scheduled
                'completed',    // Class finished (auto or manual)
                'cancelled',    // Cancelled by either party
                'disputed',     // Issue reported
                'rescheduling'  // Pending reschedule
            ])->default('pending');
            
            $table->decimal('total_price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('commission_rate', 5, 2)->default(10.00)->nullable(); // Store rate at time of booking
            
            $table->string('meeting_link')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            // For Recurring / Series Bookings
            $table->foreignId('parent_booking_id')->nullable()->constrained('bookings')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for faster lookups
            $table->index(['teacher_id', 'start_time']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
