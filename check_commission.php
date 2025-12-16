<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$settings = App\Models\PaymentSetting::first();

if ($settings) {
    echo "PaymentSettings found:\n";
    echo "  Commission Rate: {$settings->commission_rate}%\n";
    echo "  Min Payout: {$settings->min_payout_amount}\n";
} else {
    echo "No PaymentSettings record found in database.\n";
    echo "Default fallback in EscrowService: 10%\n";
}

// Also check the migration default
echo "\nBookings table default commission_rate: 10.00 (from migration)\n";
