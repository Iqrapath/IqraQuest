<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Services\Payment\PaystackService;
use App\Services\Payment\PayPalService;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected WalletService $walletService;
    protected PaystackService $paystackService;
    protected PayPalService $payPalService;

    public function __construct(
        WalletService $walletService,
        PaystackService $paystackService,
        PayPalService $payPalService
    ) {
        $this->walletService = $walletService;
        $this->paystackService = $paystackService;
        $this->payPalService = $payPalService;
    }

    /**
     * Initialize payment
     */
    public function initializePayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'gateway' => 'required|in:paystack,paypal',
            'usd_amount' => 'required_if:gateway,paypal|numeric|min:1',
            'exchange_rate' => 'nullable|numeric',
        ]);

        $user = auth()->user();
        $amount = $request->input('amount'); // Amount in Paystack currency (e.g., GHS)
        $gateway = $request->input('gateway');
        $reference = 'WAL-' . Str::upper(Str::random(10));
        
        // Ensure wallet exists before checking currency or id
        // Use wallet currency if exists, else NGN for new wallet
        $walletCurrency = $user->wallet?->currency ?? 'NGN';
        $wallet = $this->walletService->getOrCreateWallet($user->id, $walletCurrency);
        $walletCurrency = $wallet->currency; // Refresh in case it was created or different

        // Get currencies
        $paystackCurrency = config('services.paystack.currency', 'NGN');
        
        // Convert amount to wallet currency for storage
        // Frontend sends amount in Paystack currency, we need to store in wallet currency
        $walletAmount = $amount; // Default: assume same currency
        
        if ($paystackCurrency !== $walletCurrency && $gateway === 'paystack') {
            try {
                // Fetch real-time exchange rates from the same API used by frontend
                $response = Http::get('https://open.er-api.com/v6/latest/USD');
                $rates = $response->json()['rates'] ?? [];
                
                if (!empty($rates) && isset($rates[$paystackCurrency]) && isset($rates[$walletCurrency])) {
                    // Convert: Paystack currency -> USD -> Wallet currency
                    $amountInUSD = $amount / $rates[$paystackCurrency];
                    $walletAmount = $amountInUSD * $rates[$walletCurrency];
                } else {
                    \Log::warning('Failed to fetch exchange rates, using 1:1 conversion', [
                        'paystack_currency' => $paystackCurrency,
                        'wallet_currency' => $walletCurrency,
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Currency conversion failed', [
                    'error' => $e->getMessage(),
                    'paystack_currency' => $paystackCurrency,
                    'wallet_currency' => $walletCurrency,
                ]);
                // Keep walletAmount = amount as fallback
            }
        }

        // Create pending transaction in user's wallet currency
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id, // Use valid wallet ID
            'type' => 'credit',
            'amount' => $walletAmount, // Store in wallet currency
            'currency' => $walletCurrency, // Store wallet currency
            'status' => 'pending',
            'payment_gateway' => $gateway,
            'gateway_reference' => $reference,
            'description' => 'Wallet credit',
            'metadata' => [
                'type' => 'wallet_credit',
                'paystack_amount' => $amount, // Store original Paystack amount
                'paystack_currency' => $paystackCurrency,
            ],
        ]);

        if ($gateway === 'paystack') {
            // Determine callback URL based on user role
            $callbackRoute = $user->isGuardian() ? 'guardian.payment.callback' : 'student.payment.callback';

            $result = $this->paystackService->initializePayment(
                $user->email,
                $amount,
                $reference,
                ['user_id' => $user->id, 'transaction_id' => $transaction->id],
                ['card'], // Default channels
                config('services.paystack.currency', 'NGN'), // Explicitly pass the currency
                route($callbackRoute) // Pass dynamic callback URL
            );

            if ($result['status']) {
                return response()->json([
                    'status' => 'success',
                    'authorization_url' => $result['authorization_url'],
                    'reference' => $reference,
                ]);
            }
        } elseif ($gateway === 'paypal') {
            // Frontend converts NGN to USD and sends both amounts
            $usdAmount = $request->input('usd_amount');
            $exchangeRate = $request->input('exchange_rate');

            // Store conversion metadata for audit trail
            $transaction->update([
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'usd_amount' => $usdAmount,
                    'exchange_rate' => $exchangeRate,
                    'conversion_source' => 'frontend_currency_context',
                    'converted_at' => now()->toIso8601String(),
                ])
            ]);

            $result = $this->payPalService->createOrder(
                $usdAmount,
                'USD',
                $reference
            );

            if ($result['status']) {
                return response()->json([
                    'status' => 'success',
                    'approval_url' => $result['approval_url'],
                    'order_id' => $result['order_id'],
                    'converted_amount' => $usdAmount,
                    'exchange_rate' => $exchangeRate,
                ]);
            }
        }

        return response()->json([
            'status' => 'error',
            'message' => $result['message'] ?? 'Payment initialization failed',
        ], 400);
    }

    /**
     * Handle payment callback from gateway
     */
    public function callback(Request $request)
    {
        $gateway = $request->input('gateway', 'paystack');
        $reference = $request->input('reference');
        $walletRoute = $this->getUserWalletRoute();

        if ($gateway === 'paystack') {
            $result = $this->paystackService->verifyPayment($reference);

            if ($result['status'] && $result['data']['status'] === 'success') {
                // Find transaction
                $transaction = Transaction::where('gateway_reference', $reference)->first();

                if ($transaction && $transaction->status === 'pending') {
                    // Just mark as completed - webhook will handle wallet credit
                    $transaction->markAsCompleted();

                    return redirect()->route($walletRoute)
                        ->with('success', 'Payment confirmed! Your wallet will be credited shortly.');
                }
            }

            return redirect()->route($walletRoute)->with('error', 'Payment verification failed');
        } elseif ($gateway === 'paypal') {
            $orderId = $request->input('token');
            
            if ($orderId) {
                $result = $this->payPalService->captureOrder($orderId);

                if ($result['status']) {
                    // Find transaction
                    $transaction = Transaction::where('gateway_reference', $reference)->first();

                    if ($transaction && $transaction->status === 'pending') {
                        // Just mark as completed - webhook will handle wallet credit  
                        $transaction->markAsCompleted();

                        return redirect()->route($walletRoute)
                            ->with('success', 'Payment confirmed! Your wallet will be credited shortly.');
                    }
                }
            }

            return redirect()->route($walletRoute)->with('error', 'Payment failed');
        }

        return redirect()->route($walletRoute);
    }

    /**
     * Get wallet route based on user role
     */
    protected function getUserWalletRoute(): string
    {
        $role = auth()->user()->role;
        $role = $role instanceof \BackedEnum ? $role->value : $role;
        
        return match($role) {
            'student' => 'student.wallet',
            'guardian' => 'guardian.wallet',
            'teacher' => 'teacher.wallet',
            default => 'student.wallet',
        };
    }

    /**
     * Verify payment status (AJAX)
     */
    public function verifyPayment(string $reference)
    {
        $transaction = Transaction::where('gateway_reference', $reference)->first();

        if (!$transaction) {
            return response()->json(['status' => 'not_found'], 404);
        }

        if ($transaction->status === 'completed') {
            return response()->json([
                'status' => 'success',
                'transaction' => $transaction,
            ]);
        }

        // Check with gateway
        if ($transaction->payment_gateway === 'paystack') {
            $result = $this->paystackService->verifyPayment($reference);

            if ($result['status'] && $result['data']['status'] === 'success') {
                $transaction->markAsCompleted();

                return response()->json([
                    'status' => 'success',
                    'transaction' => $transaction->fresh(),
                ]);
            }
        }

        return response()->json([
            'status' => $transaction->status,
            'transaction' => $transaction,
        ]);
    }

    /**
     * Get list of banks from Paystack
     */
    public function getBanks()
    {
        try {
            \Log::info('Fetching banks from Paystack...');
            $banks = $this->paystackService->getBanks();
            \Log::info('Paystack banks response:', $banks);
            
            // Check if the response has the expected structure
            if (isset($banks['status']) && $banks['status'] === false) {
                \Log::error('Paystack returned error:', ['response' => $banks]);
                return response()->json(['error' => $banks['message'] ?? 'Unable to fetch banks'], 500);
            }
            
            // Return the data array if available
            if (isset($banks['data'])) {
                return response()->json($banks['data']);
            }
            
            return response()->json($banks);
        } catch (\Exception $e) {
            \Log::error('Error fetching banks: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Unable to fetch banks'], 500);
        }
    }

    /**
     * Resolve account number to get account name
     */
    public function resolveAccount(Request $request)
    {
        $request->validate([
            'account_number' => 'required|string|size:10',
            'bank_code' => 'required|string',
        ]);

        // Bypass for test account
        if ($request->account_number === '0000000000') {
            return response()->json([
                'account_name' => 'TEST BANK ACCOUNT',
                'account_number' => $request->account_number,
            ]);
        }

        $result = $this->paystackService->verifyBankAccount(
            $request->account_number,
            $request->bank_code
        );

        if ($result['status']) {
            return response()->json($result['data']);
        }

        return response()->json(['error' => $result['message']], 400);
    }

    /**
     * Store bank details
     */
    public function storeBankDetails(Request $request)
    {
        $request->validate([
            'account_number' => 'required|string|size:10',
            'bank_code' => 'required|string',
            'bank_name' => 'required|string',
        ]);

        $user = auth()->user();
        $student = $user->student;
        $guardian = $user->guardian;

        // Ensure profile exists
        if (!$student && !$guardian) {
             return response()->json([
                'status' => 'error',
                'message' => 'User profile not found.'
            ], 400);
        }

        // Bypass verification for test account
        if ($request->account_number === '0000000000') {
            $accountName = 'TEST BANK ACCOUNT';
        } else {
            // Double verify with Paystack
            $verification = $this->paystackService->verifyBankAccount(
                $request->account_number,
                $request->bank_code
            );

            if (!$verification['status']) {
                return response()->json([
                    'status' => 'error', 
                    'message' => 'Could not verify account details. Please try again.'
                ], 400);
            }
            $accountName = $verification['data']['account_name'];
        }

        // Check if already exists
        $exists = false;
        if ($student) {
            $exists = \App\Models\StudentPaymentMethod::where('student_id', $student->id)
                ->where('bank_account_number', $request->account_number)
                ->where('bank_code', $request->bank_code)
                ->exists();
        } else {
            $exists = \App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)
                ->where('bank_account_number', $request->account_number)
                ->where('bank_code', $request->bank_code)
                ->exists();
        }

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => 'This bank account is already added.'
            ], 400);
        }

        // Create Payment Method
        $data = [
            'type' => 'bank_account',
            'gateway' => 'paystack',
            'bank_name' => $request->bank_name,
            'bank_account_number' => $request->account_number,
            'bank_account_name' => $accountName,
            'bank_code' => $request->bank_code,
            'is_verified' => true,
            'verified_at' => now(),
        ];

        if ($student) {
             $data['student_id'] = $student->id;
             $data['is_primary'] = !\App\Models\StudentPaymentMethod::where('student_id', $student->id)->exists();
             $method = \App\Models\StudentPaymentMethod::create($data);
        } else {
             $data['guardian_id'] = $guardian->id;
             $data['is_primary'] = !\App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)->exists();
             $method = \App\Models\GuardianPaymentMethod::create($data);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Bank account added successfully',
            'data' => $method
        ]);
    }

    /**
     * Store mobile wallet details
     */
    public function storeMobileWalletDetails(Request $request)
    {
        \Log::info('Mobile Wallet Request Data:', $request->all());
        
        $request->validate([
            'phone_number' => 'required|string|min:10|max:15',
            'wallet_provider' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $user = auth()->user();
        $student = $user->student;
        $guardian = $user->guardian;

        // Ensure profile exists
        if (!$student && !$guardian) {
             return response()->json([
                'status' => 'error',
                'message' => 'User profile not found.'
            ], 400);
        }

        // Check if already exists
        $exists = false;
        if ($student) {
            $exists = \App\Models\StudentPaymentMethod::where('student_id', $student->id)
                ->where('wallet_phone_number', $request->phone_number)
                ->where('wallet_provider', $request->wallet_provider)
                ->exists();
        } else {
            $exists = \App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)
                ->where('wallet_phone_number', $request->phone_number)
                ->where('wallet_provider', $request->wallet_provider)
                ->exists();
        }

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => 'This mobile wallet is already added.'
            ], 400);
        }

        // Create Payment Method
        $data = [
            'type' => 'mobile_wallet',
            'gateway' => 'paystack', // Paystack supports mobile money
            'wallet_provider' => $request->wallet_provider,
            'wallet_phone_number' => $request->phone_number,
            'wallet_account_name' => $request->account_name,
            'is_verified' => true,
            'verified_at' => now(),
        ];

        if ($student) {
            $data['student_id'] = $student->id;
            $data['is_primary'] = !\App\Models\StudentPaymentMethod::where('student_id', $student->id)->exists();
            $method = \App\Models\StudentPaymentMethod::create($data);
        } else {
            $data['guardian_id'] = $guardian->id;
            $data['is_primary'] = !\App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)->exists();
            $method = \App\Models\GuardianPaymentMethod::create($data);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Mobile wallet added successfully',
            'data' => $method
        ]);
    }

    /**
     * Update bank details
     */
    public function updateBankDetails(Request $request, $id)
    {
        $request->validate([
            'account_number' => 'required|string|size:10',
            'bank_code' => 'required|string',
            'bank_name' => 'required|string',
        ]);

        $user = auth()->user();
        $student = $user->student;
        $guardian = $user->guardian;

        // Ensure profile exists
        if (!$student && !$guardian) {
             return response()->json([
                'status' => 'error',
                'message' => 'User profile not found.'
            ], 400);
        }

        // Find the payment method
        $method = null;
        if ($student) {
            $method = \App\Models\StudentPaymentMethod::where('id', $id)
                ->where('student_id', $student->id)
                ->first();
        } else {
             $method = \App\Models\GuardianPaymentMethod::where('id', $id)
                ->where('guardian_id', $guardian->id)
                ->first();
        }

        if (!$method) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment method not found.'
            ], 404);
        }

        // Bypass verification for test account
        if ($request->account_number === '0000000000') {
            $accountName = 'TEST BANK ACCOUNT';
        } else {
            // Verify with Paystack
            $verification = $this->paystackService->verifyBankAccount(
                $request->account_number,
                $request->bank_code
            );

            if (!$verification['status']) {
                return response()->json([
                    'status' => 'error', 
                    'message' => 'Could not verify account details. Please try again.'
                ], 400);
            }
            $accountName = $verification['data']['account_name'];
        }

        // Update the payment method
        $method->update([
            'bank_name' => $request->bank_name,
            'bank_account_number' => $request->account_number,
            'bank_account_name' => $accountName,
            'bank_code' => $request->bank_code,
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Bank details updated successfully.'
        ]);
    }

    /**
     * Store PayPal details
     */
    public function storePayPalDetails(Request $request)
    {
        $request->validate([
            'paypal_email' => 'required|email'
        ]);

        $user = auth()->user();
        $student = $user->student;
        $guardian = $user->guardian;

        // Ensure profile exists
        if (!$student && !$guardian) {
             return response()->json([
                'status' => 'error',
                'message' => 'User profile not found.'
            ], 400);
        }

        // Check if PayPal email already exists
        $existing = null;
        if ($student) {
             $existing = \App\Models\StudentPaymentMethod::where('student_id', $student->id)
                ->where('paypal_email', $request->paypal_email)
                ->first();
        } else {
             $existing = \App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)
                ->where('paypal_email', $request->paypal_email)
                ->first();
        }

        if ($existing) {
             return response()->json([
                'status' => 'error',
                'message' => 'This PayPal email is already added.'
            ], 400); 
        }

        // Set all other methods to not primary
        if ($student) {
            \App\Models\StudentPaymentMethod::where('student_id', $student->id)->update(['is_primary' => false]);
        } else {
            \App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)->update(['is_primary' => false]);
        }

        $data = [
            'type' => 'paypal',
            'gateway' => 'paypal',
            'is_primary' => true,
            'paypal_email' => $request->paypal_email,
            'is_verified' => true,
            'verified_at' => now(),
        ];

        if ($student) {
             $data['student_id'] = $student->id;
             $method = \App\Models\StudentPaymentMethod::create($data);
        } else {
             $data['guardian_id'] = $guardian->id;
             $method = \App\Models\GuardianPaymentMethod::create($data);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'PayPal account added successfully.',
            'data' => $method
        ]);
    }
    /**
     * Initiate PayPal Linking (Redirect to PayPal)
     */
    public function initiatePayPalLinking(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Determine callback route based on role
        $role = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;
        $callbackRoute = $role === 'guardian' 
            ? 'guardian.payment.methods.paypal.callback' 
            : 'student.payment.methods.paypal.callback';
            
        $redirectUri = route($callbackRoute);
        $url = $this->payPalService->getLoginUrl($redirectUri);

        return response()->json(['url' => $url]);
    }

    /**
     * Handle PayPal Linking Callback
     */
    public function handlePayPalCallback(Request $request)
    {
        $code = $request->input('code');
        
        if (!$code) {
             return redirect()->route($this->getUserWalletRoute())
                ->with('error', 'PayPal linking cancelled or failed.');
        }

        $result = $this->payPalService->getUserInfo($code);

        if (!$result['status']) {
             return redirect()->route($this->getUserWalletRoute())
                ->with('error', 'Failed to retrieve PayPal user info: ' . $result['message']);
        }

        $email = $result['data']['email'];
        $payerId = $result['data']['payer_id'];

        if (!$email) {
             return redirect()->route($this->getUserWalletRoute())
                ->with('error', 'Could not retrieve email from PayPal.');
        }

        // Now store/update the payment method
        $user = auth()->user();
        $student = $user->student;
        $guardian = $user->guardian;

        // Check if PayPal email already exists
        $existing = null;
        if ($student) {
             $existing = \App\Models\StudentPaymentMethod::where('student_id', $student->id)
                ->where('paypal_email', $email)
                ->first();
        } else {
             $existing = \App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)
                ->where('paypal_email', $email)
                ->first();
        }

        if ($existing) {
             // If exists, just ensure it's primary and verified
             $existing->update([
                 'is_primary' => true,
                 'is_verified' => true,
                 'verified_at' => now(),
                 'metadata' => ['payer_id' => $payerId] 
             ]);
        } else {
            // Unset other primaries
            if ($student) {
                \App\Models\StudentPaymentMethod::where('student_id', $student->id)->update(['is_primary' => false]);
            } else {
                \App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)->update(['is_primary' => false]);
            }

            // Create new
            $data = [
                'type' => 'paypal',
                'gateway' => 'paypal',
                'is_primary' => true,
                'paypal_email' => $email,
                'is_verified' => true,
                'verified_at' => now(),
                'metadata' => ['payer_id' => $payerId]
            ];

            if ($student) {
                 $data['student_id'] = $student->id;
                 \App\Models\StudentPaymentMethod::create($data);
            } else {
                 $data['guardian_id'] = $guardian->id;
                 \App\Models\GuardianPaymentMethod::create($data);
            }
        }

        return redirect()->route($this->getUserWalletRoute())
            ->with('success', 'PayPal account linked successfully: ' . $email);
    }
}
