<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeacherApprovalController;
use App\Http\Controllers\Admin\FinancialDashboardController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\PayoutController;
use App\Http\Controllers\Admin\BookingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Booking Management Routes
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', [BookingController::class, 'index'])->name('index');
        Route::get('/{booking}', [BookingController::class, 'show'])->name('show');
        Route::post('/{booking}/approve', [BookingController::class, 'approve'])->name('approve');
        Route::post('/{booking}/cancel', [BookingController::class, 'cancel'])->name('cancel');
        Route::post('/{booking}/reschedule', [BookingController::class, 'reschedule'])->name('reschedule');
        Route::post('/{booking}/reassign-teacher', [BookingController::class, 'reassignTeacher'])->name('reassign-teacher');
        Route::get('/{booking}/available-teachers', [BookingController::class, 'getAvailableTeachers'])->name('available-teachers');
        Route::post('/bulk-approve', [BookingController::class, 'bulkApprove'])->name('bulk-approve');
        Route::post('/bulk-cancel', [BookingController::class, 'bulkCancel'])->name('bulk-cancel');
    });
    
    // Financial Management Routes
    Route::prefix('finances')->name('finances.')->group(function () {
        Route::get('/', [FinancialDashboardController::class, 'index'])->name('index');
    });

    // Transaction Routes
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::get('/export', [TransactionController::class, 'export'])->name('export');
        Route::get('/{id}', [TransactionController::class, 'show'])->name('show');
        Route::post('/{id}/refund', [TransactionController::class, 'refund'])->name('refund');
    });

    // Payout Routes
    Route::prefix('payouts')->name('payouts.')->group(function () {
        // Bank Resolution Routes (Must be before /{id})
        Route::get('/banks', [PayoutController::class, 'getBanks'])->name('banks');
        Route::get('/resolve-account', [PayoutController::class, 'resolveAccount'])->name('resolve-account');

        Route::get('/', [PayoutController::class, 'index'])->name('index');
        Route::get('/{id}', [PayoutController::class, 'show'])->name('show');
        Route::post('/{id}/approve', [PayoutController::class, 'approve'])->name('approve');
        Route::post('/{id}/reject', [PayoutController::class, 'reject'])->name('reject');
        Route::post('/bulk-approve', [PayoutController::class, 'bulkApprove'])->name('bulk-approve');
        Route::post('/{id}/process', [PayoutController::class, 'process'])->name('process');
        Route::post('/{id}/update-method', [PayoutController::class, 'updatePaymentMethod'])->name('update-method');
    });

    // Teacher Management Routes
    Route::prefix('teachers')->name('teachers.')->group(function () {
        // List/Index route
        Route::get('/', [\App\Http\Controllers\Admin\TeacherController::class, 'index'])->name('index');
        
        // Specific routes BEFORE dynamic parameter routes
        Route::get('/pending', [TeacherApprovalController::class, 'index'])->name('pending');
        Route::get('/history', [TeacherApprovalController::class, 'history'])->name('history');
        Route::get('/create', [\App\Http\Controllers\Admin\TeacherController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\TeacherController::class, 'store'])->name('store');
        
        // Dynamic parameter routes
        Route::get('/{teacher}/analytics', [\App\Http\Controllers\Admin\TeacherController::class, 'analytics'])->name('analytics');
        Route::patch('/{teacher}/status', [\App\Http\Controllers\Admin\TeacherController::class, 'updateStatus'])->name('update-status');
        Route::post('/{teacher}/approve', [TeacherApprovalController::class, 'approve'])->name('approve');
        Route::post('/{teacher}/reject', [TeacherApprovalController::class, 'reject'])->name('reject');
        Route::put('/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'update'])->name('update');
        Route::put('/{teacher}/subjects', [\App\Http\Controllers\Admin\TeacherController::class, 'updateSubjects'])->name('update-subjects');
        Route::put('/{teacher}/subjects-details', [\App\Http\Controllers\Admin\TeacherController::class, 'updateSubjectsDetails'])->name('update-subjects-details');
        
        // Edit route (must be before show route)
        Route::get('/{teacher}/edit', [\App\Http\Controllers\Admin\TeacherController::class, 'edit'])->name('edit');
        
        // Show route LAST (catches anything not matched above)
        Route::get('/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'show'])->name('show');
        // Teacher Document Routes
        Route::post('/{teacher}/documents/upload', [\App\Http\Controllers\Admin\TeacherController::class, 'uploadDocument'])->name('documents.upload');
        Route::post('/{teacher}/documents/{certificate}/verify', [\App\Http\Controllers\Admin\TeacherController::class, 'verifyDocument'])->name('documents.verify');
    });

    // Payment Management Hub
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('index');
        Route::put('/settings', [\App\Http\Controllers\Admin\PaymentController::class, 'updateSettings'])->name('update-settings');
    });

    // Dispute Management Routes
    Route::prefix('disputes')->name('disputes.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\DisputeController::class, 'index'])->name('index');
        Route::get('/{booking}', [\App\Http\Controllers\Admin\DisputeController::class, 'show'])->name('show');
        Route::post('/{booking}/resolve-teacher', [\App\Http\Controllers\Admin\DisputeController::class, 'resolveForTeacher'])->name('resolve-teacher');
        Route::post('/{booking}/resolve-student', [\App\Http\Controllers\Admin\DisputeController::class, 'resolveForStudent'])->name('resolve-student');
        Route::post('/{booking}/resolve-partial', [\App\Http\Controllers\Admin\DisputeController::class, 'resolvePartial'])->name('resolve-partial');
    });

    // Notification Management Routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\NotificationController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\NotificationController::class, 'store'])->name('store');
        Route::get('/search-users', [\App\Http\Controllers\Admin\NotificationController::class, 'searchUsers'])->name('search-users');
        Route::get('/{broadcast}', [\App\Http\Controllers\Admin\NotificationController::class, 'show'])->name('show');
        Route::post('/{broadcast}/send', [\App\Http\Controllers\Admin\NotificationController::class, 'send'])->name('send');
        Route::post('/{broadcast}/resend', [\App\Http\Controllers\Admin\NotificationController::class, 'resend'])->name('resend');
        Route::post('/{broadcast}/cancel', [\App\Http\Controllers\Admin\NotificationController::class, 'cancel'])->name('cancel');
        Route::delete('/{broadcast}', [\App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('destroy');
    });

    // Messages Routes
    Route::prefix('messages')->name('messages.')->group(function () {
        Route::get('/unread-count', [\App\Http\Controllers\MessageController::class, 'unreadCount'])->name('unread-count');
        Route::get('/recent', [\App\Http\Controllers\MessageController::class, 'recent'])->name('recent');
        Route::get('/', [\App\Http\Controllers\MessageController::class, 'index'])->name('index');
        Route::post('/user/{user}', [\App\Http\Controllers\MessageController::class, 'startWithUser'])->name('start-with-user');
        Route::get('/{conversation}', [\App\Http\Controllers\MessageController::class, 'show'])->name('show');
        Route::post('/{conversation}', [\App\Http\Controllers\MessageController::class, 'store'])->name('store');
        Route::post('/{conversation}/typing', [\App\Http\Controllers\MessageController::class, 'typing'])->name('typing');
        Route::post('/{conversation}/read', [\App\Http\Controllers\MessageController::class, 'markAsRead'])->name('read');
    });

    });
