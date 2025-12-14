<?php

use App\Http\Controllers\Teacher\CertificateController;
use App\Http\Controllers\Teacher\DashboardController;
use App\Http\Controllers\Teacher\OnboardingController;
use App\Http\Controllers\Teacher\WaitingAreaController;
use App\Http\Controllers\Teacher\EarningsController;
use App\Http\Controllers\Teacher\PayoutController;
use App\Http\Controllers\Teacher\PaymentController;
use App\Http\Controllers\Student\WalletController; // Shared wallet controller
use Illuminate\Support\Facades\Route;

// Onboarding Routes (Auth only - no email verification required)
Route::middleware(['auth', 'role:teacher'])
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        Route::get('/onboarding/step-1', [OnboardingController::class, 'step1'])->name('onboarding.step1');
        Route::post('/onboarding/step-1', [OnboardingController::class, 'storeStep1']);
        
        Route::get('/onboarding/step-2', [OnboardingController::class, 'step2'])->name('onboarding.step2');
        Route::post('/onboarding/step-2', [OnboardingController::class, 'storeStep2']);
        
        Route::get('/onboarding/step-3', [OnboardingController::class, 'step3'])->name('onboarding.step3');
        Route::post('/onboarding/step-3', [OnboardingController::class, 'storeStep3']);
        
        Route::get('/onboarding/step-4', [OnboardingController::class, 'step4'])->name('onboarding.step4');
        Route::post('/onboarding/step-4', [OnboardingController::class, 'storeStep4']);
        
        // Certificate Upload (During onboarding)
        Route::post('/certificates', [CertificateController::class, 'store'])->name('certificates.store');
        Route::delete('/certificates/{certificate}', [CertificateController::class, 'destroy'])->name('certificates.destroy');
    });

// Post-Onboarding Routes (Require email verification)
Route::middleware(['auth', 'verified', 'role:teacher'])
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        // Waiting Area (Pending/Rejected teachers)
        Route::get('/waiting-area', [WaitingAreaController::class, 'index'])->name('waiting-area');
        
        // Dashboard (Approved teachers only)
        Route::middleware('teacher.approved')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            // Booking Requests Management
            Route::get('/requests', [\App\Http\Controllers\Teacher\BookingController::class, 'index'])->name('requests.index');
            Route::post('/requests/{booking}/accept', [\App\Http\Controllers\Teacher\BookingController::class, 'accept'])->name('requests.accept');
            Route::post('/requests/{booking}/reject', [\App\Http\Controllers\Teacher\BookingController::class, 'reject'])->name('requests.reject');

            
            // Wallet Routes (teachers can view their wallet like students)
            Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
            Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
            Route::get('/wallet/transactions/export', [WalletController::class, 'exportTransactions'])->name('wallet.transactions.export');
            
            // Earnings Routes
            Route::get('/earnings', [EarningsController::class, 'index'])->name('earnings');
            Route::get('/earnings/transactions', [EarningsController::class, 'transactions'])->name('earnings.transactions');
            Route::post('/earnings/settings', [EarningsController::class, 'updateSettings'])->name('earnings.settings');
            Route::get('/earnings/export', [EarningsController::class, 'exportReport'])->name('earnings.export');
            
            // Payout Routes
            Route::get('/payouts', [PayoutController::class, 'index'])->name('payouts.index');
            Route::get('/payouts/create', [PayoutController::class, 'create'])->name('payouts.create');
            Route::post('/payouts', [PayoutController::class, 'store'])->name('payouts.store');
            Route::get('/payouts/{id}', [PayoutController::class, 'show'])->name('payouts.show');
            Route::post('/payouts/{id}/cancel', [PayoutController::class, 'cancel'])->name('payouts.cancel');
            
            // Payment Method Routes
            Route::get('/payment/banks', [PaymentController::class, 'getBanks'])->name('payment.banks');
            Route::get('/payment/resolve-account', [PaymentController::class, 'resolveAccount'])->name('payment.resolve-account');
            
            // Bank Account Management
            Route::post('/payment/methods/bank', [PaymentController::class, 'storeBankDetails'])->name('payment.methods.bank.store');
            Route::put('/payment/methods/bank/{id}', [PaymentController::class, 'updateBankDetails'])->name('payment.methods.bank.update');
            Route::delete('/payment/methods/bank/{id}', [PaymentController::class, 'deleteBankDetails'])->name('payment.methods.bank.delete');
            
            // Mobile Wallet Management
            Route::post('/payment/methods/mobile-wallet', [PaymentController::class, 'storeMobileWalletDetails'])->name('payment.methods.mobile-wallet.store');
            Route::put('/payment/methods/mobile-wallet/{id}', [PaymentController::class, 'updateMobileWalletDetails'])->name('payment.methods.mobile-wallet.update');
            Route::delete('/payment/methods/mobile-wallet/{id}', [PaymentController::class, 'deleteMobileWalletDetails'])->name('payment.methods.mobile-wallet.delete');
            
            // PayPal Management
            Route::post('/payment/methods/paypal', [PaymentController::class, 'storePayPalDetails'])->name('payment.methods.paypal.store');
            Route::put('/payment/methods/paypal/{id}', [PaymentController::class, 'updatePayPalDetails'])->name('payment.methods.paypal.update');
            Route::delete('/payment/methods/paypal/{id}', [PaymentController::class, 'deletePayPalDetails'])->name('payment.methods.paypal.delete');
            
            // PayPal OAuth
            Route::get('/payment/methods/paypal/initiate', [PaymentController::class, 'initiatePayPalLinking'])->name('payment.methods.paypal.initiate');
            Route::get('/payment/methods/paypal/callback', [PaymentController::class, 'handlePayPalCallback'])->name('payment.methods.paypal.callback');
        });
    });
