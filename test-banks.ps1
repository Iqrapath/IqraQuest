php artisan tinker --execute="
\$user = \App\Models\User::find(4);
\Auth::login(\$user);
\$controller = app(\App\Http\Controllers\Student\PaymentController::class);
\$response = \$controller->getBanks();
dd(\$response->getData(true));
"
