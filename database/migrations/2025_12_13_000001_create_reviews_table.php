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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade'); // The teacher involved
            $table->foreignId('user_id')->constrained()->onDelete('cascade');    // The student/guardian involved (User model)
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');
            
            $table->enum('reviewer_type', ['student', 'teacher', 'guardian']); // Who wrote this review?
            
            $table->integer('rating');
            $table->text('comment')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();

            // Prevent duplicate reviews: One review per party per booking
            // e.g. Student can review Booking #1 once, Teacher can review Booking #1 once
            $table->unique(['booking_id', 'user_id', 'reviewer_type'], 'unique_review_per_party');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
