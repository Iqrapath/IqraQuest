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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            
            // Approval Workflow
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('approval_override_reason')->nullable();
            $table->timestamp('application_submitted_at')->nullable();

            // Video Verification
            $table->enum('video_verification_status', ['not_scheduled', 'scheduled', 'completed', 'failed'])->default('not_scheduled');
            $table->string('video_verification_room_id')->nullable();
            $table->timestamp('video_verification_scheduled_at')->nullable();
            $table->string('video_verification_platform', 100)->default('IqraQuest Live');
            $table->text('video_verification_notes')->nullable();
            
            // Step 1: Personal Information
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('preferred_language', 50)->nullable()->default('English');
            
            // Step 2: Teaching Details
            $table->text('bio')->nullable();
            $table->string('intro_video_url')->nullable();
            $table->text('qualifications')->nullable();
            $table->string('qualification_level', 100)->nullable();
            $table->json('specializations')->nullable();
            $table->integer('experience_years')->nullable();
            
            // Step 3: Availability & Schedule
            $table->string('timezone', 50)->nullable()->default('Africa/Lagos');
            $table->enum('teaching_mode', ['full-time', 'part-time', 'both'])->default('full-time');
            $table->enum('teaching_type', ['online', 'in-person', 'both'])->default('online');
            $table->boolean('holiday_mode')->default(false); // Teacher is on holiday/vacation
            
            // Step 4: Payment & Earnings
            $table->string('preferred_currency', 10)->default('NGN');
            $table->boolean('automatic_payouts')->default(false);
            $table->timestamp('last_payout_requested_at')->nullable(); // Last manual OR auto payout request
            $table->timestamp('last_auto_payout_at')->nullable(); // Last automatic payout specifically
            $table->decimal('hourly_rate', 10, 2)->nullable();
            
            // Teacher Type & Subscription Teaching
            $table->enum('teacher_type', ['freelance', 'subscription', 'hybrid'])->default('freelance');
            $table->decimal('per_student_rate', 12, 2)->nullable(); // Monthly rate per assigned subscription student
            $table->decimal('per_session_rate', 12, 2)->nullable(); // Bonus per session conducted
            
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('approved_at');
            $table->index('holiday_mode');
            $table->index('teacher_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
