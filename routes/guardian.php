<?php

use App\Http\Controllers\Guardian\DashboardController;
use App\Http\Controllers\Guardian\BookingController;
use App\Http\Controllers\Guardian\TeacherController;
use App\Http\Controllers\Student\WalletController;
use App\Http\Controllers\Student\PaymentController;
use Illuminate\Support\Facades\Route;

// Guardian Routes (shares wallet/payment controllers with students)
Route::middleware(['auth', 'verified', 'role:guardian'])
    ->prefix('guardian')
    ->name('guardian.')
    ->group(function () {
        // Onboarding Routes
        Route::get('/onboarding/subjects', [\App\Http\Controllers\Guardian\OnboardingController::class, 'getSubjects'])->name('onboarding.subjects');
        Route::post('/onboarding/complete', [\App\Http\Controllers\Guardian\OnboardingController::class, 'complete'])->name('onboarding.complete');
        Route::post('/onboarding/skip', [\App\Http\Controllers\Guardian\OnboardingController::class, 'skip'])->name('onboarding.skip');

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/quick-start', [DashboardController::class, 'quickStart'])->name('quick-start');
        Route::get('/children', [DashboardController::class, 'children'])->name('children.index');
        Route::get('/children/{student}/edit', [DashboardController::class, 'editChild'])->name('children.edit');
        Route::get('/children/{student}/progress', [DashboardController::class, 'progress'])->name('children.progress');
        Route::patch('/children/{student}', [DashboardController::class, 'updateChild'])->name('children.update');
        
        // Profile Routes (Implementation matches Figma design)
        Route::get('/profile', [\App\Http\Controllers\Guardian\ProfileController::class, 'index'])->name('profile.index');
        Route::post('/profile', [\App\Http\Controllers\Guardian\ProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/avatar', [\App\Http\Controllers\Guardian\ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
        
        // Browse Teachers Routes
        Route::get('/teachers', [TeacherController::class, 'index'])->name('teachers.index');
        Route::get('/teachers/{id}', [TeacherController::class, 'show'])->name('teachers.show');
        
        // Booking Creation Routes (Guardian books for themselves)
        Route::get('/book/{teacherId}', [BookingController::class, 'index'])->name('book.index');
        Route::post('/book/process', [BookingController::class, 'store'])->name('book.process');
        Route::post('/book/check-availability', [BookingController::class, 'checkAvailability'])->name('book.check-availability');
        
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
        
        // Notification Routes
        Route::get('/notifications', [\App\Http\Controllers\Guardian\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\Guardian\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Guardian\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        Route::delete('/notifications/{id}', [\App\Http\Controllers\Guardian\NotificationController::class, 'destroy'])->name('notifications.destroy');
        Route::delete('/notifications', [\App\Http\Controllers\Guardian\NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');
        
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

        // Settings Routes
        Route::get('/settings', [\App\Http\Controllers\Guardian\SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings/account', [\App\Http\Controllers\Guardian\SettingsController::class, 'updateAccountInfo'])->name('settings.account');
        Route::put('/settings/password', [\App\Http\Controllers\Guardian\SettingsController::class, 'updatePassword'])->name('settings.password');
        Route::post('/settings/two-factor', [\App\Http\Controllers\Guardian\SettingsController::class, 'toggleTwoFactor'])->name('settings.two-factor');
        Route::post('/settings/deactivation', [\App\Http\Controllers\Guardian\SettingsController::class, 'toggleDeactivation'])->name('settings.deactivation');
        Route::put('/settings/notifications', [\App\Http\Controllers\Guardian\SettingsController::class, 'updateNotifications'])->name('settings.notifications');
        Route::post('/settings/resend-verification', [\App\Http\Controllers\Guardian\SettingsController::class, 'resendEmailVerification'])->name('settings.resend-verification');
        Route::delete('/settings/delete-account', [\App\Http\Controllers\Guardian\SettingsController::class, 'deleteAccount'])->name('settings.delete-account');

        // Ratings & Feedback
        Route::get('/ratings', [\App\Http\Controllers\Guardian\RatingController::class, 'index'])->name('ratings.index');
        Route::get('/ratings/feedback', [\App\Http\Controllers\Guardian\RatingController::class, 'feedback'])->name('ratings.feedback');
        Route::get('/ratings/all', [\App\Http\Controllers\Guardian\RatingController::class, 'allReviews'])->name('ratings.all');
        Route::post('/ratings', [\App\Http\Controllers\Guardian\RatingController::class, 'store'])->name('ratings.store');
        Route::put('/ratings/{review}', [\App\Http\Controllers\Guardian\RatingController::class, 'update'])->name('ratings.update');
    });
