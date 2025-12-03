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
        Route::put('/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'update'])->name('update');
        Route::put('/{teacher}/subjects', [\App\Http\Controllers\Admin\TeacherController::class, 'updateSubjects'])->name('update-subjects');
        Route::put('/{teacher}/subjects-details', [\App\Http\Controllers\Admin\TeacherController::class, 'updateSubjectsDetails'])->name('update-subjects-details');
        
        // Edit route (must be before show route)
        Route::get('/{teacher}/edit', [\App\Http\Controllers\Admin\TeacherController::class, 'edit'])->name('edit');
        
        // Show route LAST (catches anything not matched above)
        Route::get('/{teacher}', [\App\Http\Controllers\Admin\TeacherController::class, 'show'])->name('show');
        // Admin Routes (Should be in admin.php but adding here for visibility/context if needed, or move to admin.php)
        Route::post('/{teacher}/documents/upload', [\App\Http\Controllers\Admin\TeacherController::class, 'uploadDocument'])->name('teachers.documents.upload');
        Route::post('/{teacher}/documents/{certificate}/verify', [\App\Http\Controllers\Admin\TeacherController::class, 'verifyDocument'])->name('teachers.documents.verify');
    });
    });
