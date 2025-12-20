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
        Route::post('/wallet/currency', [WalletController::class, 'updateCurrency'])->name('wallet.currency');
        Route::get('/wallet/credit', [WalletController::class, 'creditWallet'])->name('wallet.credit');
        Route::get('/payment/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
        Route::get('/payment/transactions/export', [WalletController::class, 'exportTransactions'])->name('wallet.transactions.export');
        
        // Payment Routes (shared with students)
        Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
        Route::get('/payment/verify/{reference}', [PaymentController::class, 'verifyPayment'])->name('payment.verify');
        
        Route::get('/payment/banks', [PaymentController::class, 'getBanks'])->name('payment.banks');
        Route::get('/payment/resolve-account', [PaymentController::class, 'resolveAccount'])->name('payment.resolve-account');
        Route::post('/payment/methods/bank', [PaymentController::class, 'storeBankDetails'])->name('payment.methods.bank.store');
        // Matching frontend call: /payment/methods/bank/{id}
        Route::put('/payment/methods/bank/{id}', [PaymentController::class, 'updateBankDetails'])->name('payment.methods.bank.update');
        Route::post('/payment/methods/mobile-wallet', [PaymentController::class, 'storeMobileWalletDetails'])->name('payment.methods.mobile-wallet.store');
        Route::post('/payment/methods/paypal', [PaymentController::class, 'storePayPalDetails'])->name('payment.methods.paypal.store');
        
        // PayPal OAuth Routes
        Route::get('/payment/methods/paypal/initiate', [PaymentController::class, 'initiatePayPalLinking'])->name('payment.methods.paypal.initiate');
        Route::get('/payment/methods/paypal/callback', [PaymentController::class, 'handlePayPalCallback'])->name('payment.methods.paypal.callback');
        
        Route::post('/payment/initialize', [PaymentController::class, 'initializePayment'])->name('payment.initialize');
        
        // Dispute Routes (guardians can dispute bookings they made for their children)
        Route::post('/booking/{booking}/dispute', [\App\Http\Controllers\Student\DisputeController::class, 'store'])->name('booking.dispute');
        
        // Booking Cancellation Routes (guardians can cancel bookings they made)
        Route::get('/booking/{booking}/cancellation-details', [\App\Http\Controllers\Student\BookingCancellationController::class, 'getCancellationDetails'])->name('booking.cancellation-details');
        Route::post('/booking/{booking}/cancel', [\App\Http\Controllers\Student\BookingCancellationController::class, 'cancel'])->name('booking.cancel');
        
        // Reschedule Routes (guardians can reschedule bookings they made)
        Route::get('/booking/{booking}/reschedule', [\App\Http\Controllers\Student\RescheduleController::class, 'index'])->name('booking.reschedule');
        Route::post('/booking/{booking}/reschedule', [\App\Http\Controllers\Student\RescheduleController::class, 'store'])->name('booking.reschedule.store');
        Route::post('/booking/{booking}/reschedule/check-availability', [\App\Http\Controllers\Student\RescheduleController::class, 'checkAvailability'])->name('booking.reschedule.check-availability');
        Route::post('/reschedule-request/{rescheduleRequest}/cancel', [\App\Http\Controllers\Student\RescheduleController::class, 'cancelRequest'])->name('reschedule-request.cancel');
        
        // My Bookings Routes (guardians see bookings they made for their children)
        Route::get('/bookings', [\App\Http\Controllers\Student\BookingController::class, 'myBookings'])->name('bookings.index');
        Route::get('/bookings/{booking}', [\App\Http\Controllers\Student\BookingController::class, 'show'])->name('bookings.show');
        Route::get('/bookings/{booking}/details', [\App\Http\Controllers\Student\BookingController::class, 'details'])->name('bookings.details');
        Route::post('/bookings/{booking}/review', [\App\Http\Controllers\Student\BookingController::class, 'submitReview'])->name('bookings.review');
        Route::put('/bookings/{booking}/review', [\App\Http\Controllers\Student\BookingController::class, 'updateReview'])->name('bookings.review.update');
        Route::get('/bookings/{booking}/summary/pdf', [\App\Http\Controllers\BookingSummaryController::class, 'show'])->name('bookings.summary.pdf');
        
        // Calendar Export Routes
        Route::get('/calendar/export', [\App\Http\Controllers\CalendarExportController::class, 'exportAllBookings'])->name('calendar.export');
        Route::get('/calendar/export/{booking}', [\App\Http\Controllers\CalendarExportController::class, 'exportBooking'])->name('calendar.export.booking');
        Route::get('/calendar/google/{booking}', [\App\Http\Controllers\CalendarExportController::class, 'googleCalendarUrl'])->name('calendar.google');
    });
