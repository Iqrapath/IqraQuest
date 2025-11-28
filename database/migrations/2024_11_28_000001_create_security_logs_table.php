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
        Schema::create('security_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type')->index();
            $table->string('ip_address', 45)->index();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->string('severity')->default('info'); // info, warning, critical
            $table->timestamps();
            
            $table->index(['event_type', 'created_at']);
            $table->index(['ip_address', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_logs');
    }
};
