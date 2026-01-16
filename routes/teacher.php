<?php

use App\Http\Controllers\Teacher\CertificateController;
use App\Http\Controllers\Teacher\DashboardController;
use App\Http\Controllers\Teacher\OnboardingController;
use App\Http\Controllers\Teacher\WaitingAreaController;
use App\Http\Controllers\Teacher\EarningsController;
use App\Http\Controllers\Teacher\PayoutController;
use App\Http\Controllers\Teacher\PaymentController;
use App\Http\Controllers\Student\WalletController; // Shared wallet controller
use App\Http\Controllers\VerificationRoomController;
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
        Route::post('/waiting-area/message', [WaitingAreaController::class, 'sendMessage'])->name('waiting-area.message');
        
        // Verification Room
        Route::get('/verification/room/{teacher}', [VerificationRoomController::class, 'join'])->name('verification.room');
        
        // Dashboard (Approved teachers only)
        Route::middleware('teacher.approved')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
            Route::get('/quick-start', [DashboardController::class, 'quickStart'])->name('quick-start');

            // Profile Routes
            Route::get('/profile', [\App\Http\Controllers\Teacher\ProfileController::class, 'index'])->name('profile.index');
            Route::post('/profile', [\App\Http\Controllers\Teacher\ProfileController::class, 'update'])->name('profile.update');
            Route::post('/profile/avatar', [\App\Http\Controllers\Teacher\ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
            Route::post('/profile/video', [\App\Http\Controllers\Teacher\ProfileController::class, 'uploadVideo'])->name('profile.video.upload');

            // Booking Management
            Route::get('/bookings', [\App\Http\Controllers\Teacher\BookingController::class, 'myBookings'])->name('bookings.index');
            Route::get('/requests', [\App\Http\Controllers\Teacher\BookingController::class, 'index'])->name('requests.index');
            Route::post('/requests/bulk-accept', [\App\Http\Controllers\Teacher\BookingController::class, 'bulkAccept'])->name('requests.bulk-accept');
            Route::post('/requests/bulk-reject', [\App\Http\Controllers\Teacher\BookingController::class, 'bulkReject'])->name('requests.bulk-reject');
            Route::post('/requests/{booking}/accept', [\App\Http\Controllers\Teacher\BookingController::class, 'accept'])->name('requests.accept');
            Route::post('/requests/{booking}/reject', [\App\Http\Controllers\Teacher\BookingController::class, 'reject'])->name('requests.reject');
            Route::post('/requests/{booking}/reschedule/accept', [\App\Http\Controllers\Teacher\BookingController::class, 'acceptReschedule'])->name('requests.reschedule.accept');
            Route::post('/requests/{booking}/reschedule/reject', [\App\Http\Controllers\Teacher\BookingController::class, 'rejectReschedule'])->name('requests.reschedule.reject');
            
            // Booking Cancellation
            Route::get('/booking/{booking}/cancellation-details', [\App\Http\Controllers\Teacher\BookingController::class, 'getCancellationDetails']);
            Route::post('/booking/{booking}/cancel', [\App\Http\Controllers\Teacher\BookingController::class, 'cancel']);
            Route::get('/bookings/{booking}/summary/pdf', [\App\Http\Controllers\BookingSummaryController::class, 'show'])->name('bookings.summary.pdf');

            // Schedule & Availability Management
            Route::get('/schedule', [\App\Http\Controllers\Teacher\ScheduleController::class, 'index'])->name('schedule.index');
            Route::post('/schedule/availability', [\App\Http\Controllers\Teacher\ScheduleController::class, 'updateAvailability'])->name('schedule.availability.update');
            Route::post('/schedule/holiday-mode', [\App\Http\Controllers\Teacher\ScheduleController::class, 'toggleHolidayMode'])->name('schedule.holiday-mode.toggle');
            Route::get('/schedule/sessions', [\App\Http\Controllers\Teacher\ScheduleController::class, 'getSessionsForDate'])->name('schedule.sessions.date');
            
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
            
            // Calendar Export Routes
            Route::get('/calendar/export', [\App\Http\Controllers\CalendarExportController::class, 'exportAllBookings'])->name('calendar.export');
            Route::get('/calendar/export/{booking}', [\App\Http\Controllers\CalendarExportController::class, 'exportBooking'])->name('calendar.export.booking');
            Route::get('/calendar/google/{booking}', [\App\Http\Controllers\CalendarExportController::class, 'googleCalendarUrl'])->name('calendar.google');
            
            // Notification Routes
            Route::get('/notifications', [\App\Http\Controllers\Teacher\NotificationController::class, 'index'])->name('notifications.index');
            Route::post('/notifications/{id}/read', [\App\Http\Controllers\Teacher\NotificationController::class, 'markAsRead'])->name('notifications.read');
            Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Teacher\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
            Route::delete('/notifications/{id}', [\App\Http\Controllers\Teacher\NotificationController::class, 'destroy'])->name('notifications.destroy');
            Route::delete('/notifications', [\App\Http\Controllers\Teacher\NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');
            
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
            Route::get('/settings', [\App\Http\Controllers\Teacher\SettingsController::class, 'index'])->name('settings.index');
            Route::put('/settings/account', [\App\Http\Controllers\Teacher\SettingsController::class, 'updateAccountInfo'])->name('settings.account');
            Route::put('/settings/password', [\App\Http\Controllers\Teacher\SettingsController::class, 'updatePassword'])->name('settings.password');
            Route::post('/settings/two-factor', [\App\Http\Controllers\Teacher\SettingsController::class, 'toggleTwoFactor'])->name('settings.two-factor');
            Route::post('/settings/deactivation', [\App\Http\Controllers\Teacher\SettingsController::class, 'toggleDeactivation'])->name('settings.deactivation');
            Route::put('/settings/notifications', [\App\Http\Controllers\Teacher\SettingsController::class, 'updateNotifications'])->name('settings.notifications');
            Route::post('/settings/resend-verification', [\App\Http\Controllers\Teacher\SettingsController::class, 'resendEmailVerification'])->name('settings.resend-verification');
            Route::delete('/settings/delete-account', [\App\Http\Controllers\Teacher\SettingsController::class, 'deleteAccount'])->name('settings.delete-account');

            // Ratings & Feedback
            Route::get('/ratings', [\App\Http\Controllers\Teacher\RatingController::class, 'index'])->name('ratings.index');
            Route::get('/ratings/feedback', [\App\Http\Controllers\Teacher\RatingController::class, 'feedback'])->name('ratings.feedback');
            Route::get('/ratings/all', [\App\Http\Controllers\Teacher\RatingController::class, 'allReviews'])->name('ratings.all');
            Route::post('/ratings', [\App\Http\Controllers\Teacher\RatingController::class, 'store'])->name('ratings.store');
            Route::put('/ratings/{review}', [\App\Http\Controllers\Teacher\RatingController::class, 'update'])->name('ratings.update');
        });
    });
