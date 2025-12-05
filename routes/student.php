<?php

use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\WalletController;
use App\Http\Controllers\Student\PaymentController;
use Illuminate\Support\Facades\Route;

// Student Routes
Route::middleware(['auth', 'verified', 'role:student'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Wallet Routes
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
        Route::get('/wallet/credit', [WalletController::class, 'creditWallet'])->name('wallet.credit');
        Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
        Route::get('/wallet/transactions/export', [WalletController::class, 'exportTransactions'])->name('wallet.transactions.export');
        
        // Payment Routes
        Route::post('/payment/initialize', [PaymentController::class, 'initializePayment'])->name('payment.initialize');
        Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
        Route::get('/payment/verify/{reference}', [PaymentController::class, 'verifyPayment'])->name('payment.verify');
    });
