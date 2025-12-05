<?php

use App\Http\Controllers\Guardian\DashboardController;
use App\Http\Controllers\Student\WalletController;
use App\Http\Controllers\Student\PaymentController;
use Illuminate\Support\Facades\Route;

// Guardian Routes (shares wallet/payment controllers with students)
Route::middleware(['auth', 'verified', 'role:guardian'])
    ->prefix('guardian')
    ->name('guardian.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Wallet Routes (shared with students)
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
        Route::get('/wallet/credit', [WalletController::class, 'creditWallet'])->name('wallet.credit');
        Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
        Route::get('/wallet/transactions/export', [WalletController::class, 'exportTransactions'])->name('wallet.transactions.export');
        
        // Payment Routes (shared with students)
        Route::post('/payment/initialize', [PaymentController::class, 'initializePayment'])->name('payment.initialize');
        Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
        Route::get('/payment/verify/{reference}', [PaymentController::class, 'verifyPayment'])->name('payment.verify');
    });
