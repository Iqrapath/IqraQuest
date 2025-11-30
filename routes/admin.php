<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeacherApprovalController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Teacher Approval System
        Route::prefix('teachers')->name('teachers.')->group(function () {
            Route::get('/pending', [TeacherApprovalController::class, 'index'])->name('pending');
            Route::get('/history', [TeacherApprovalController::class, 'history'])->name('history');
            Route::get('/{teacher}', [TeacherApprovalController::class, 'show'])->name('show');
            Route::post('/{teacher}/approve', [TeacherApprovalController::class, 'approve'])->name('approve');
            Route::post('/{teacher}/reject', [TeacherApprovalController::class, 'reject'])->name('reject');
        });
    });
