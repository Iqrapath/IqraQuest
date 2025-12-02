<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeacherApprovalController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Teacher Management Routes
    Route::prefix('teachers')->name('teachers.')->group(function () {
        // List/Index route
        Route::get('/', [\App\Http\Controllers\Admin\TeacherController::class, 'index'])->name('index');
        
        // Specific routes BEFORE dynamic parameter routes
        Route::get('/pending', [TeacherApprovalController::class, 'index'])->name('pending');
        Route::get('/history', [TeacherApprovalController::class, 'history'])->name('history');
        
        // Dynamic parameter routes
        Route::get('/{teacher}/analytics', [\App\Http\Controllers\Admin\TeacherController::class, 'analytics'])->name('analytics');
        Route::patch('/{teacher}/status', [\App\Http\Controllers\Admin\TeacherController::class, 'updateStatus'])->name('update-status');
        Route::post('/{teacher}/approve', [TeacherApprovalController::class, 'approve'])->name('approve');
        Route::post('/{teacher}/reject', [TeacherApprovalController::class, 'reject'])->name('reject');
        
        // Show route LAST (catches anything not matched above)
        Route::get('/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'show'])->name('show');
    });
    });
