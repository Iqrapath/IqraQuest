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
        Route::get('/quick-start', [DashboardController::class, 'quickStart'])->name('quick-start');
        
        // Profile Routes (Implementation matches Figma design)
        Route::get('/profile', [\App\Http\Controllers\Student\ProfileController::class, 'index'])->name('profile.index');
        Route::post('/profile', [\App\Http\Controllers\Student\ProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/avatar', [\App\Http\Controllers\Student\ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
        
        // Teachers Routes
        Route::get('/teachers', [\App\Http\Controllers\Student\TeacherController::class, 'index'])->name('teachers.index');
        Route::get('/teachers/{id}', [\App\Http\Controllers\Student\TeacherController::class, 'show'])->name('teachers.show');
        
        // Booking Routes
        Route::get('/book/{teacherId}', [\App\Http\Controllers\Student\BookingController::class, 'index'])->name('book.index');
        Route::post('/book/process', [\App\Http\Controllers\Student\BookingController::class, 'store'])->name('book.process');
        Route::post('/book/check-availability', [\App\Http\Controllers\Student\BookingController::class, 'checkAvailability'])->name('book.check-availability');
        
        // My Bookings Routes
        Route::get('/bookings', [\App\Http\Controllers\Student\BookingController::class, 'myBookings'])->name('bookings.index');
        Route::get('/bookings/{booking}', [\App\Http\Controllers\Student\BookingController::class, 'show'])->name('bookings.show');
        Route::get('/bookings/{booking}/details', [\App\Http\Controllers\Student\BookingController::class, 'details'])->name('bookings.details');
        Route::post('/bookings/{booking}/review', [\App\Http\Controllers\Student\BookingController::class, 'submitReview'])->name('bookings.review');
        Route::put('/bookings/{booking}/review', [\App\Http\Controllers\Student\BookingController::class, 'updateReview'])->name('bookings.review.update');
        Route::get('/bookings/{booking}/summary/pdf', [\App\Http\Controllers\BookingSummaryController::class, 'show'])->name('bookings.summary.pdf');
        
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
        
        // Dispute Routes
        Route::post('/booking/{booking}/dispute', [\App\Http\Controllers\Student\DisputeController::class, 'store'])->name('booking.dispute');
        
        // Booking Cancellation Routes
        Route::get('/booking/{booking}/cancellation-details', [\App\Http\Controllers\Student\BookingCancellationController::class, 'getCancellationDetails'])->name('booking.cancellation-details');
        Route::post('/booking/{booking}/cancel', [\App\Http\Controllers\Student\BookingCancellationController::class, 'cancel'])->name('booking.cancel');
        
        // Reschedule Routes
        Route::get('/booking/{booking}/reschedule', [\App\Http\Controllers\Student\RescheduleController::class, 'index'])->name('booking.reschedule');
        Route::post('/booking/{booking}/reschedule', [\App\Http\Controllers\Student\RescheduleController::class, 'store'])->name('booking.reschedule.store');
        Route::post('/booking/{booking}/reschedule/check-availability', [\App\Http\Controllers\Student\RescheduleController::class, 'checkAvailability'])->name('booking.reschedule.check-availability');
        Route::post('/reschedule-request/{rescheduleRequest}/cancel', [\App\Http\Controllers\Student\RescheduleController::class, 'cancelRequest'])->name('reschedule-request.cancel');
        
        // Calendar Export Routes
        Route::get('/calendar/export', [\App\Http\Controllers\CalendarExportController::class, 'exportAllBookings'])->name('calendar.export');
        Route::get('/calendar/export/{booking}', [\App\Http\Controllers\CalendarExportController::class, 'exportBooking'])->name('calendar.export.booking');
        Route::get('/calendar/google/{booking}', [\App\Http\Controllers\CalendarExportController::class, 'googleCalendarUrl'])->name('calendar.google');
        
        // Notification Routes
        Route::get('/notifications', [\App\Http\Controllers\Student\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\Student\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Student\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        Route::delete('/notifications/{id}', [\App\Http\Controllers\Student\NotificationController::class, 'destroy'])->name('notifications.destroy');
        Route::delete('/notifications', [\App\Http\Controllers\Student\NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');
        
        // Messages Routes
        Route::post('/messages/support', [\App\Http\Controllers\MessageController::class, 'startWithAdmin'])->name('messages.support');
        Route::get('/messages/unread-count', [\App\Http\Controllers\MessageController::class, 'unreadCount'])->name('messages.unread-count');
        Route::get('/messages/recent', [\App\Http\Controllers\MessageController::class, 'recent'])->name('messages.recent');
        Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
        Route::get('/messages/{conversation}', [\App\Http\Controllers\MessageController::class, 'show'])->name('messages.show');
        Route::post('/messages/{conversation}', [\App\Http\Controllers\MessageController::class, 'store'])->name('messages.store');
        Route::post('/messages/{conversation}/typing', [\App\Http\Controllers\MessageController::class, 'typing'])->name('messages.typing');
        Route::post('/messages/{conversation}/read', [\App\Http\Controllers\MessageController::class, 'markAsRead'])->name('messages.read');
        Route::post('/messages/booking/{booking}', [\App\Http\Controllers\MessageController::class, 'startFromBooking'])->name('messages.from-booking');
        
        // Student Ratings & Feedback
        Route::get('/ratings', [\App\Http\Controllers\Student\RatingController::class, 'index'])->name('ratings.index');
        Route::get('/ratings/feedback', [\App\Http\Controllers\Student\RatingController::class, 'feedback'])->name('ratings.feedback');
        Route::get('/ratings/all', [\App\Http\Controllers\Student\RatingController::class, 'allReviews'])->name('ratings.all');
        Route::post('/ratings', [\App\Http\Controllers\Student\RatingController::class, 'store'])->name('ratings.store');
        Route::put('/ratings/{review}', [\App\Http\Controllers\Student\RatingController::class, 'update'])->name('ratings.update');

        // Settings Routes
        Route::get('/settings', [\App\Http\Controllers\Student\SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings/account', [\App\Http\Controllers\Student\SettingsController::class, 'updateAccountInfo'])->name('settings.account');
        Route::put('/settings/password', [\App\Http\Controllers\Student\SettingsController::class, 'updatePassword'])->name('settings.password');
        Route::post('/settings/two-factor', [\App\Http\Controllers\Student\SettingsController::class, 'toggleTwoFactor'])->name('settings.two-factor');
        Route::post('/settings/deactivation', [\App\Http\Controllers\Student\SettingsController::class, 'toggleDeactivation'])->name('settings.deactivation');
        Route::put('/settings/notifications', [\App\Http\Controllers\Student\SettingsController::class, 'updateNotifications'])->name('settings.notifications');
        Route::post('/settings/resend-verification', [\App\Http\Controllers\Student\SettingsController::class, 'resendEmailVerification'])->name('settings.resend-verification');
        Route::delete('/settings/delete-account', [\App\Http\Controllers\Student\SettingsController::class, 'deleteAccount'])->name('settings.delete-account');
    });
