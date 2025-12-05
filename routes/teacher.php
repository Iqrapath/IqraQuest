<?php

use App\Http\Controllers\Teacher\CertificateController;
use App\Http\Controllers\Teacher\DashboardController;
use App\Http\Controllers\Teacher\OnboardingController;
use App\Http\Controllers\Teacher\WaitingAreaController;
use App\Http\Controllers\Teacher\EarningsController;
use App\Http\Controllers\Teacher\PayoutController;
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
            
            // Wallet Routes (teachers can view their wallet like students)
            Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
            Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
            Route::get('/wallet/transactions/export', [WalletController::class, 'exportTransactions'])->name('wallet.transactions.export');
            
            // Earnings Routes
            Route::get('/earnings', [EarningsController::class, 'index'])->name('earnings');
            Route::get('/earnings/transactions', [EarningsController::class, 'transactions'])->name('earnings.transactions');
            Route::get('/earnings/export', [EarningsController::class, 'exportReport'])->name('earnings.export');
            
            // Payout Routes
            Route::get('/payouts', [PayoutController::class, 'index'])->name('payouts.index');
            Route::get('/payouts/create', [PayoutController::class, 'create'])->name('payouts.create');
            Route::post('/payouts', [PayoutController::class, 'store'])->name('payouts.store');
            Route::get('/payouts/{id}', [PayoutController::class, 'show'])->name('payouts.show');
            Route::post('/payouts/{id}/cancel', [PayoutController::class, 'cancel'])->name('payouts.cancel');
        });
    });
