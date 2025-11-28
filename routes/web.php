<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Redirect to role-specific dashboard
    Route::get('dashboard', function () {
        return redirect()->route(auth()->user()->dashboardRoute());
    })->name('dashboard');
});

require __DIR__.'/settings.php';
