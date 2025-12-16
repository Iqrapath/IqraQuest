<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classroom_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['teacher', 'student']);
            $table->timestamp('joined_at');
            $table->timestamp('left_at')->nullable();
            $table->integer('duration_seconds')->default(0); // Total time in session
            $table->string('connection_quality')->nullable(); // good, fair, poor
            $table->json('metadata')->nullable(); // Additional data like device info
            $table->timestamps();

            // Indexes for faster queries
            $table->index(['booking_id', 'user_id']);
            $table->index('joined_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_attendance');
    }
};
