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
        Schema::table('bookings', function (Blueprint $table) {
            // 1. Add judgment tracking columns (Idempotent checks for safety)
            if (! Schema::hasColumn('bookings', 'judgment_at')) {
                $table->timestamp('judgment_at')->nullable()->after('session_ended_at');
            }
            if (! Schema::hasColumn('bookings', 'judgment_reason')) {
                $table->text('judgment_reason')->nullable()->after('judgment_at');
            }
        });

        // 2. Update status ENUM to include 'ongoing' and 'awaiting_judgment' (MySQL/MariaDB only; SQLite uses string columns)
        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
                'pending',
                'awaiting_payment',
                'awaiting_approval',
                'confirmed',
                'ongoing',
                'awaiting_judgment',
                'completed',
                'cancelled',
                'disputed',
                'rescheduling'
            ) NOT NULL DEFAULT 'pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
                'pending',
                'awaiting_payment',
                'awaiting_approval',
                'confirmed',
                'completed',
                'cancelled',
                'disputed',
                'rescheduling'
            ) NOT NULL DEFAULT 'pending'");
        }

        // Remove judgment tracking columns
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['judgment_at', 'judgment_reason']);
        });
    }
};
