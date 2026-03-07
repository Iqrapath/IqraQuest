<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // 1. Add judgment tracking columns (Idempotent checks for safety)
            if (!Schema::hasColumn('bookings', 'judgment_at')) {
                $table->timestamp('judgment_at')->nullable()->after('session_ended_at');
            }
            if (!Schema::hasColumn('bookings', 'judgment_reason')) {
                $table->text('judgment_reason')->nullable()->after('judgment_at');
            }
        });

        // 2. Update status ENUM to include 'ongoing' and 'awaiting_judgment'
        // Using raw SQL to avoid the "Data truncated" warning in MySQL strict mode
        \DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
            'pending',           -- Initial state
            'awaiting_payment',  -- Created, payment link generated
            'awaiting_approval', -- Paid, waiting for teacher acceptance
            'confirmed',         -- Accepted and scheduled
            'ongoing',           -- Session currently live (both parties joined)
            'awaiting_judgment', -- Session ended, waiting for arbiter ruling
            'completed',         -- Funds released to teacher
            'cancelled',         -- Cancelled by student/teacher
            'disputed',          -- Manual dispute raised
            'rescheduling'       -- Reschedule request pending
        ) NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Revert status ENUM to original 8 values
        \DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
            'pending',
            'awaiting_payment',
            'awaiting_approval',
            'confirmed',
            'completed',
            'cancelled',
            'disputed',
            'rescheduling'
        ) NOT NULL DEFAULT 'pending'");

        // 2. Remove judgment tracking columns
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['judgment_at', 'judgment_reason']);
        });
    }
};
