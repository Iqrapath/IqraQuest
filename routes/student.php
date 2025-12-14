<?php

use App\Http\Controllers\Api\Student\TeacherController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\FilterController;
use App\Http\Controllers\Student\DashboardController;

// API Routes for Browse Teachers
Route::get('/api/teachers', [TeacherController::class, 'index'])->name('api.teachers.index');
Route::get('/api/teachers/{id}', [TeacherController::class, 'show'])->name('api.teachers.show');
Route::get('/api/subjects', [SubjectController::class, 'index'])->name('api.subjects.index');
Route::get('/api/filter-options', [FilterController::class, 'getOptions'])->name('api.filter-options');

// Page Routes
use App\Http\Controllers\Student\WalletController;
use App\Http\Controllers\Student\PaymentController;
use Illuminate\Support\Facades\Route;

// Student Routes
Route::middleware(['auth', 'verified', 'role:student'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Teachers Routes
        Route::get('/teachers', [\App\Http\Controllers\Student\TeacherController::class, 'index'])->name('teachers.index');
        Route::get('/teachers/{id}', [\App\Http\Controllers\Student\TeacherController::class, 'show'])->name('teachers.show');
        
        // Booking Routes
        Route::get('/book/{teacherId}', [\App\Http\Controllers\Student\BookingController::class, 'index'])->name('book.index');
        Route::post('/book/process', [\App\Http\Controllers\Student\BookingController::class, 'store'])->name('book.process');
        Route::post('/book/check-availability', [\App\Http\Controllers\Student\BookingController::class, 'checkAvailability'])->name('book.check-availability');
        
        // Wallet Routes
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
        Route::post('/wallet/currency', [WalletController::class, 'updateCurrency'])->name('wallet.currency');
        Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
        Route::get('/wallet/transactions/export', [WalletController::class, 'exportTransactions'])->name('wallet.transactions.export');
        
        // Payment Routes
        Route::post('/payment/initialize', [PaymentController::class, 'initializePayment'])->name('payment.initialize');
        Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
        Route::get('/payment/verify/{reference}', [PaymentController::class, 'verifyPayment'])->name('payment.verify');
        Route::get('/payment/banks', [PaymentController::class, 'getBanks'])->name('payment.banks');
        Route::get('/payment/resolve-account', [PaymentController::class, 'resolveAccount'])->name('payment.resolve-account');
        Route::post('/payment/methods/bank', [PaymentController::class, 'storeBankDetails'])->name('payment.methods.bank.store');
        Route::put('/payment/methods/bank-details/{id}', [PaymentController::class, 'updateBankDetails'])->name('payment.methods.bank.update');
        Route::post('/payment/methods/mobile-wallet', [PaymentController::class, 'storeMobileWalletDetails'])->name('payment.methods.mobile-wallet.store');
        Route::post('/payment/methods/paypal', [PaymentController::class, 'storePayPalDetails'])->name('payment.methods.paypal.store');
        
        // PayPal OAuth Routes
        Route::get('/payment/methods/paypal/initiate', [PaymentController::class, 'initiatePayPalLinking'])->name('payment.methods.paypal.initiate');
        Route::get('/payment/methods/paypal/callback', [PaymentController::class, 'handlePayPalCallback'])->name('payment.methods.paypal.callback');
    });
