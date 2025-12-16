<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classroom_polls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('question');
            $table->json('options'); // Array of option strings
            $table->enum('type', ['poll', 'quiz'])->default('poll');
            $table->integer('correct_option')->nullable(); // For quiz type
            $table->boolean('is_active')->default(true);
            $table->boolean('show_results')->default(false);
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'is_active']);
        });

        Schema::create('classroom_poll_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('classroom_polls')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('selected_option');
            $table->timestamps();

            $table->unique(['poll_id', 'user_id']); // One response per user per poll
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_poll_responses');
        Schema::dropIfExists('classroom_polls');
    }
};
