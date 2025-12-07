<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Services\Payment\PaystackService;
use App\Services\Payment\PayPalService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaystackService $paystackService;
    protected PayPalService $payPalService;

    public function __construct(
        PaystackService $paystackService,
        PayPalService $payPalService
    ) {
        $this->paystackService = $paystackService;
        $this->payPalService = $payPalService;
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
        $teacher = $user->teacher;

        // Ensure profile exists
        if (!$teacher) {
             return response()->json([
                'status' => 'error',
                'message' => 'Teacher profile not found.'
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
        $exists = \App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)
            ->where('account_number', $request->account_number)
            ->where('bank_code', $request->bank_code)
            ->exists();

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => 'This bank account is already added.'
            ], 400);
        }

        // Create Payment Method
        $data = [
            'teacher_id' => $teacher->id,
            'payment_type' => 'bank_transfer',
            'bank_name' => $request->bank_name,
            'account_number' => $request->account_number,
            'account_name' => $accountName,
            'bank_code' => $request->bank_code,
            'is_verified' => true,
            'verified_at' => now(),
            'is_primary' => !\App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)->exists(),
        ];

        $method = \App\Models\TeacherPaymentMethod::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Bank account added successfully',
            'data' => [
                'id' => $method->id,
                'type' => 'bank_account',
                'bank_name' => $method->bank_name,
                'bank_account_number' => $method->account_number,
                'bank_account_name' => $method->account_name,
                'bank_code' => $method->bank_code,
                'is_primary' => $method->is_primary,
                'is_verified' => $method->is_verified,
            ]
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
        $teacher = $user->teacher;

        if (!$teacher) {
             return response()->json([
                'status' => 'error',
                'message' => 'Teacher profile not found.'
            ], 400);
        }

        // Find the payment method
        $method = \App\Models\TeacherPaymentMethod::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

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
            'account_number' => $request->account_number,
            'account_name' => $accountName,
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
     * Delete bank details
     */
    public function deleteBankDetails($id)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        $method = \App\Models\TeacherPaymentMethod::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$method) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment method not found.'
            ], 404);
        }

        $method->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Bank account deleted successfully.'
        ]);
    }

    /**
     * Store mobile wallet details
     */
    public function storeMobileWalletDetails(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string|min:10|max:15',
            'wallet_provider' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
             return response()->json([
                'status' => 'error',
                'message' => 'Teacher profile not found.'
            ], 400);
        }

        // Check if already exists
        $exists = \App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)
            ->where('account_number', $request->phone_number)
            ->where('routing_number', $request->wallet_provider) // Using routing_number for provider
            ->exists();

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => 'This mobile wallet is already added.'
            ], 400);
        }

        // Create Payment Method
        $data = [
            'teacher_id' => $teacher->id,
            'payment_type' => 'mobile_wallet',
            'account_number' => $request->phone_number,
            'routing_number' => $request->wallet_provider,
            'account_name' => $request->account_name,
            'is_verified' => true,
            'verified_at' => now(),
            'is_primary' => !\App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)->exists(),
        ];

        $method = \App\Models\TeacherPaymentMethod::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Mobile wallet added successfully',
            'data' => [
                'id' => $method->id,
                'type' => 'mobile_wallet',
                'wallet_provider' => $method->routing_number,
                'wallet_phone_number' => $method->account_number,
                'wallet_account_name' => $method->account_name,
                'is_primary' => $method->is_primary,
                'is_verified' => $method->is_verified,
            ]
        ]);
    }

    /**
     * Update mobile wallet details
     */
    public function updateMobileWalletDetails(Request $request, $id)
    {
        $request->validate([
            'phone_number' => 'required|string|min:10|max:15',
            'wallet_provider' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
             return response()->json([
                'status' => 'error',
                'message' => 'Teacher profile not found.'
            ], 400);
        }

        $method = \App\Models\TeacherPaymentMethod::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$method) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment method not found.'
            ], 404);
        }

        $method->update([
            'account_number' => $request->phone_number,
            'routing_number' => $request->wallet_provider,
            'account_name' => $request->account_name,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mobile wallet updated successfully.'
        ]);
    }

    /**
     * Delete mobile wallet
     */
    public function deleteMobileWalletDetails($id)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        $method = \App\Models\TeacherPaymentMethod::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$method) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment method not found.'
            ], 404);
        }

        $method->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mobile wallet deleted successfully.'
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
        $teacher = $user->teacher;

        if (!$teacher) {
             return response()->json([
                'status' => 'error',
                'message' => 'Teacher profile not found.'
            ], 400);
        }

        // Check if PayPal email already exists
        $existing = \App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)
            ->where('email', $request->paypal_email)
            ->first();

        if ($existing) {
             return response()->json([
                'status' => 'error',
                'message' => 'This PayPal email is already added.'
            ], 400); 
        }

        // Set all other methods to not primary
        \App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)->update(['is_primary' => false]);

        $data = [
            'teacher_id' => $teacher->id,
            'payment_type' => 'paypal',
            'email' => $request->paypal_email,
            'is_verified' => true,
            'verified_at' => now(),
            'is_primary' => true,
        ];

        $method = \App\Models\TeacherPaymentMethod::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'PayPal account added successfully.',
            'data' => $method
        ]);
    }

    /**
     * Update PayPal details
     */
    public function updatePayPalDetails(Request $request, $id)
    {
        $request->validate([
            'paypal_email' => 'required|email'
        ]);

        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
             return response()->json([
                'status' => 'error',
                'message' => 'Teacher profile not found.'
            ], 400);
        }

        $method = \App\Models\TeacherPaymentMethod::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$method) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment method not found.'
            ], 404);
        }

        $method->update([
            'email' => $request->paypal_email,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'PayPal account updated successfully.'
        ]);
    }

    /**
     * Delete PayPal account
     */
    public function deletePayPalDetails($id)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        $method = \App\Models\TeacherPaymentMethod::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$method) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment method not found.'
            ], 404);
        }

        $method->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'PayPal account deleted successfully.'
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
        $callbackRoute = 'teacher.payment.methods.paypal.callback';
            
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
             return redirect()->route('teacher.earnings')
                ->with('error', 'PayPal linking cancelled or failed.');
        }

        $result = $this->payPalService->getUserInfo($code);

        if (!$result['status']) {
             return redirect()->route('teacher.earnings')
                ->with('error', 'Failed to retrieve PayPal user info: ' . $result['message']);
        }

        $email = $result['data']['email'];
        $payerId = $result['data']['payer_id'];

        if (!$email) {
             return redirect()->route('teacher.earnings')
                ->with('error', 'Could not retrieve email from PayPal.');
        }

        // Now store/update the payment method
        $user = auth()->user();
        $teacher = $user->teacher;

        // Check if PayPal email already exists
        $existing = \App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)
            ->where('email', $email)
            ->first();

        if ($existing) {
             // If exists, just ensure it's primary and verified
             $existing->update([
                 'is_primary' => true,
                 'is_verified' => true,
                 'verified_at' => now(),
                 'recipient_code' => $payerId 
             ]);
        } else {
            // Unset other primaries
            \App\Models\TeacherPaymentMethod::where('teacher_id', $teacher->id)->update(['is_primary' => false]);

            // Create new
            $data = [
                'teacher_id' => $teacher->id,
                'payment_type' => 'paypal',
                'email' => $email,
                'is_verified' => true,
                'verified_at' => now(),
                'is_primary' => true,
                'recipient_code' => $payerId
            ];

            \App\Models\TeacherPaymentMethod::create($data);
        }

        return redirect()->route('teacher.earnings')
            ->with('success', 'PayPal account linked successfully: ' . $email);
    }
}
