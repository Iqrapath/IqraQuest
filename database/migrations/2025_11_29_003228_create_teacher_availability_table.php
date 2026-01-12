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
        Schema::create('teacher_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            
            // Day of week
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            
            // Is this day available?
            $table->boolean('is_available')->default(false);
            
            // Time slots
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            
            $table->timestamps();
            
            // Unique constraint: prevent duplicate time slots (same teacher, day, start_time)
            // This allows multiple slots per day with different start times
            $table->unique(['teacher_id', 'day_of_week', 'start_time']);
            $table->index('teacher_id');
            $table->index('day_of_week');
            $table->index('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_availability');
    }
};
