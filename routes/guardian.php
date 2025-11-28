<?php

use App\Http\Controllers\Guardian\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:guardian'])
    ->prefix('guardian')
    ->name('guardian.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Add more guardian routes here
    });
