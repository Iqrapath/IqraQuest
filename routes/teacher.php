<?php

use App\Http\Controllers\Teacher\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:teacher'])
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Add more teacher routes here
    });
