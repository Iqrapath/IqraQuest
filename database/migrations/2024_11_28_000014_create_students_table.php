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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            
            // Profile Details
            $table->text('bio')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('timezone', 50)->nullable()->default('Africa/Lagos');
            
            // Preferences
            $table->json('preferred_days')->nullable(); // Monday, Tuesday...
            $table->string('preferred_hours')->nullable(); // e.g. "3 PM - 9 PM"
            $table->string('availability_type')->nullable(); // e.g. "Part-Time"
            // Subjects moved to pivot table
            $table->text('learning_goal_description')->nullable(); // "Complete Hifz..."

            $table->json('learning_goals')->nullable(); // Existing one, keeping for compatibility or usage
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
