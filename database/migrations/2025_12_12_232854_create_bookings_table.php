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
            
            // ===== ESCROW / PAYMENT STATUS =====
            $table->enum('payment_status', [
                'pending',      // Not yet paid
                'held',         // Paid, funds in escrow
                'released',     // Funds transferred to teacher
                'refunded',     // Funds returned to student
                'disputed',     // Under review
                'partial',      // Partial payment/refund
            ])->default('pending');
            
            $table->decimal('total_price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('commission_rate', 5, 2)->default(15.00)->nullable(); // Store rate at time of booking
            
            // ===== ESCROW TRACKING =====
            $table->timestamp('funds_held_at')->nullable();
            $table->timestamp('funds_released_at')->nullable();
            $table->timestamp('funds_refunded_at')->nullable();
            $table->decimal('amount_released', 15, 2)->nullable();
            $table->decimal('amount_refunded', 15, 2)->nullable();
            
            // ===== DISPUTE HANDLING =====
            $table->timestamp('dispute_raised_at')->nullable();
            $table->text('dispute_reason')->nullable();
            $table->timestamp('dispute_resolved_at')->nullable();
            $table->text('dispute_resolution')->nullable();
            $table->unsignedBigInteger('dispute_resolved_by')->nullable();
            
            // ===== SESSION COMPLETION TRACKING =====
            $table->boolean('teacher_attended')->default(false);
            $table->boolean('student_attended')->default(false);
            $table->integer('actual_duration_minutes')->nullable();
            $table->timestamp('session_started_at')->nullable();
            $table->timestamp('session_ended_at')->nullable();
            $table->timestamp('no_show_warning_sent_at')->nullable();
            
            $table->string('meeting_link')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            // For Recurring / Series Bookings
            $table->foreignId('parent_booking_id')->nullable()->constrained('bookings')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key for dispute resolver
            $table->foreign('dispute_resolved_by')->references('id')->on('users')->nullOnDelete();
            
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
