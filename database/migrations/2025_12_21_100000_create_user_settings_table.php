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
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Account Settings
            $table->boolean('is_online')->default(true);
            $table->string('username')->nullable();
            $table->string('base_currency', 3)->default('NGN');
            
            // Notification Settings
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_notifications')->default(true);
            $table->boolean('mobile_alerts')->default(true);
            
            // Alert Preferences
            $table->boolean('alert_new_messages')->default(true);
            $table->boolean('alert_session_requests')->default(true);
            $table->boolean('alert_payment_updates')->default(true);
            
            // Account Status
            $table->boolean('account_deactivated')->default(false);
            $table->timestamp('deactivated_at')->nullable();
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
