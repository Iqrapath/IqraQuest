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
        Schema::create('system_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('category'); // e.g., APP, AUTH, DB, ERROR, SEVERE
            $table->string('event_type'); // e.g., MODEL_UPDATED, EXCEPTION_CAUGHT
            $table->text('description')->nullable();
            
            $table->string('subject_type')->nullable(); // Polymorphic subject (e.g., Booking)
            $table->unsignedBigInteger('subject_id')->nullable();
            
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->json('metadata')->nullable(); // Request ID, IP, URL, UserAgent
            
            $table->string('severity')->default('info'); // info, warning, error, critical
            $table->timestamp('created_at')->useCurrent();
            
            // Note: system_activities are append-only. No updated_at.
            
            $table->index(['category', 'event_type', 'created_at']);
            $table->index(['subject_type', 'subject_id']);

            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_activities');
    }
};
