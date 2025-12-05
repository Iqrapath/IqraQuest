# IqraQuest Financial System - Backend Architecture

**Complete backend structure for Students/Guardians, Teachers, and Admins**

---

## 🎯 Overview

Financial system built on **2 payment gateways**:
- **Paystack** - Cards, Banks, Verification, Payouts
- **PayPal** - Optional alternative

Built for **3 user roles**:
1. **Student/Guardian** - Pay for sessions, manage wallet
2. **Teacher** - Receive earnings, request payouts, manage wallet
3. **Admin** - Manage platform finances, approve payouts

---

## 📊 Database Tables Needed

### 1. Wallets
```php
wallets:
- id
- user_id (student or teacher)
- balance (decimal)
- currency (default: NGN)
- created_at, updated_at
```

### 2. Transactions
```php
transactions:
- id
- user_id (who initiated)
- wallet_id
- type (enum: credit, debit, booking_payment, payout, refund)
- amount
- currency
- status (pending, completed, failed)
- payment_gateway (paystack, paypal, null)
- gateway_reference (transaction ID from gateway)
- description
- metadata (json - booking_id, teacher_id, etc.)
- created_at, updated_at
```

### 3. Payment Methods (Students)
```php
student_payment_methods:
- id
- student_id
- type (enum: card, bank_account, paypal)
- gateway (paystack, paypal)
- is_primary
- 
// For Cards (Paystack)
- card_authorization_code (from Paystack)
- card_last4
- card_brand (visa, mastercard, verve)
- card_exp_month
- card_exp_year

// For Bank Accounts (Paystack Direct Debit)
- bank_name
- bank_account_number
- bank_account_name

// For PayPal
- paypal_email

- is_verified
- verified_at
- created_at, updated_at
```

### 4. Teacher Payment Methods
**Already exists:** `teacher_payment_methods` ✅
```php
teacher_payment_methods:
- id
- teacher_id
- payment_type (enum: bank_transfer, paypal, stripe, flutterwave, paystack)
- is_primary
- bank_name, account_number, account_name, bank_code
- email (PayPal)
- is_verified, verified_at
```

### 5. Payouts
```php
payouts:
- id
- teacher_id
- amount
- currency
- status (pending, approved, processing, completed, failed, rejected)
- payment_method_id
- gateway (paystack, paypal)
- gateway_reference
- gateway_response (json)
- requested_at
- approved_at
- approved_by (admin_id)
- processed_at
- rejected_at
- rejection_reason
- created_at, updated_at
```

### 6. Platform Earnings
```php
platform_earnings:
- id
- transaction_id
- booking_id
- amount (platform commission)
- percentage (e.g., 15)
- created_at
```

---

## 🏗️ Backend Services

### Payment Gateway Services

#### 1. `app/Services/Payment/PaystackService.php`
```php
Methods:
- initializeCardPayment($email, $amount, $reference)
- verifyPayment($reference)
- createVirtualAccount($email, $amount, $reference)
- chargeAuthorization($authCode, $email, $amount)
- verifyBankAccount($accountNumber, $bankCode)
- transferToBank($recipientCode, $amount, $reason)
- createTransferRecipient($accountName, $accountNumber, $bankCode)
- verifyWebhookSignature($signature, $input)
- getTransactionStatus($reference)
```

#### 2. `app/Services/Payment/PayPalService.php`
```php
Methods:
- createOrder($amount, $currency, $reference)
- captureOrder($orderId)
- createPayout($recipientEmail, $amount, $note)
- getOrderDetails($orderId)
- verifyWebhookSignature($headers, $body)
```

#### 3. `app/Services/Payment/PaymentGatewayFactory.php`
```php
Methods:
- make($gateway) // Returns PaystackService or PayPalService
```

### Business Logic Services

#### 4. `app/Services/WalletService.php`
```php
Methods:
- creditWallet($userId, $amount, $description, $metadata = [])
- debitWallet($userId, $amount, $description, $metadata = [])
- getBalance($userId)
- canDebit($userId, $amount)
- createTransaction($data)
```

#### 5. `app/Services/PayoutService.php`
```php
Methods:
- requestPayout($teacherId, $amount, $paymentMethodId)
- approvePayout($payoutId, $adminId)
- rejectPayout($payoutId, $reason, $adminId)
- processPayout($payoutId) // Calls gateway API
- calculateAvailableBalance($teacherId)
- getPendingEarnings($teacherId)
```

#### 6. `app/Services/TransactionService.php`
```php
Methods:
- recordBookingPayment($bookingId, $studentId, $amount, $gateway, $reference)
- recordPayout($teacherId, $amount, $gateway, $reference)
- recordRefund($transactionId, $amount, $reason)
- getTransactionHistory($userId, $filters = [])
```

---

## 🎮 Controllers by Role

### Student/Guardian Controllers

#### 1. `app/Http/Controllers/Student/WalletController.php`
```php
Routes: /student/wallet/*

Methods:
- index() // Wallet dashboard (balance, recent transactions)
- creditWallet() // Show credit wallet page
- transactions() // Transaction history
- exportTransactions() // Download as PDF/CSV
```

#### 2. `app/Http/Controllers/Student/PaymentController.php`
```php
Routes: /student/payments/*

Methods:
- checkout($bookingId) // Payment checkout page
- initializePayment(Request) // Start payment process
- callback() // Payment gateway callback (Paystack/PayPal)
- verifyPayment($reference) // AJAX verify payment status
```

#### 3. `app/Http/Controllers/Student/PaymentMethodController.php`
```php
Routes: /student/payment-methods/*

Methods:
- index() // List saved payment methods
- store(Request) // Add new payment method (card/bank/paypal)
- destroy($id) // Remove payment method
- setPrimary($id) // Set as default
- verifyCard(Request) // Verify card before saving
- verifyBankAccount(Request) // Verify bank account
```

---

### Teacher Controllers

#### 7. `app/Http/Controllers/Teacher/EarningsController.php`
```php
Routes: /teacher/earnings/*

Methods:
- index() // Earnings dashboard
  - Total earnings
  - Available balance
  - Pending earnings
  - Earnings chart by month
- transactions() // Earnings transaction history
- exportReport($month) // Download earnings report
```

#### 8. `app/Http/Controllers/Teacher/PayoutController.php`
```php
Routes: /teacher/payouts/*

Methods:
- index() // Payout history
- create() // Request payout form
- store(Request) // Submit payout request
- show($id) // Payout details
- cancel($id) // Cancel pending payout
```

#### 9. `app/Http/Controllers/Teacher/PaymentMethodController.php`
```php
Routes: /teacher/payment-methods/*

Methods:
- index() // List teacher payment methods
- create() // Add payment method form
- store(Request) // Save payment method
- edit($id) // Edit payment method
- update($id, Request) // Update payment method
- destroy($id) // Remove payment method
- setPrimary($id) // Set as default for payouts
- verifyBankAccount(Request) // Verify bank with Paystack API
```

---

### Admin Controllers

#### 10. `app/Http/Controllers/Admin/FinancialDashboardController.php`
```php
Routes: /admin/finances/*

Methods:
- index() // Financial overview dashboard
  - Total revenue
  - Platform earnings
  - Pending payouts
  - Revenue charts
  - Recent transactions
```

#### 11. `app/Http/Controllers/Admin/TransactionController.php`
```php
Routes: /admin/transactions/*

Methods:
- index() // All platform transactions
- show($id) // Transaction details
- refund($id) // Issue refund
- export() // Export transactions report
```

#### 12. `app/Http/Controllers/Admin/PayoutController.php`
```php
Routes: /admin/payouts/*

Methods:
- index() // Payout queue (pending, approved, all)
- show($id) // Payout details
- approve($id) // Approve payout request
- reject($id, Request) // Reject with reason
- bulkApprove(Request) // Approve multiple payouts
- process($id) // Process approved payout (calls gateway)
```

#### 13. `app/Http/Controllers/Admin/PaymentGatewayController.php`
```php
Routes: /admin/payment-gateways/*

Methods:
- index() // Gateway configuration page
- updatePaystack(Request) // Update Paystack keys
- updatePayPal(Request) // Update PayPal keys
- testConnection($gateway) // Test API connection
- toggleGateway($gateway) // Enable/disable gateway
```

#### 14. `app/Http/Controllers/Admin/ReportsController.php`
```php
Routes: /admin/reports/*

Methods:
- revenue() // Revenue reports
- payouts() // Payout reports
- transactions() // Transaction reports
- platformEarnings() // Commission earnings
- exportRevenue($startDate, $endDate)
- exportPayouts($month)
```

---

### Webhook Controllers

#### 15. `app/Http/Controllers/Webhooks/PaystackWebhookController.php`
```php
Route: /webhooks/paystack (public, no auth)

Methods:
- handle(Request) // Handle all Paystack webhooks
  - charge.success → Credit wallet or confirm booking payment
  - transfer.success → Mark payout as completed
  - transfer.failed → Mark payout as failed
```

#### 16. `app/Http/Controllers/Webhooks/PayPalWebhookController.php`
```php
Route: /webhooks/paypal (public, no auth)

Methods:
- handle(Request) // Handle all PayPal webhooks
  - PAYMENT.CAPTURE.COMPLETED → Confirm payment
  - PAYOUT-ITEM.SUCCEEDED → Mark payout as completed
  - PAYOUT-ITEM.FAILED → Mark payout as failed
```

---

## 🛣️ Routes Structure

### Student/Guardian Routes
```php
Route::middleware(['auth', 'role:student'])->prefix('student')->group(function () {
    // Wallet
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/credit', [WalletController::class, 'creditWallet']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    
    // Payments
    Route::get('/checkout/{booking}', [PaymentController::class, 'checkout']);
    Route::post('/payment/initialize', [PaymentController::class, 'initializePayment']);
    Route::get('/payment/callback', [PaymentController::class, 'callback']);
    Route::get('/payment/verify/{reference}', [PaymentController::class, 'verifyPayment']);
    
    // Payment Methods
    Route::resource('payment-methods', PaymentMethodController::class);
    Route::post('/payment-methods/{id}/set-primary', [PaymentMethodController::class, 'setPrimary']);
    Route::post('/payment-methods/verify-card', [PaymentMethodController::class, 'verifyCard']);
    Route::post('/payment-methods/verify-bank', [PaymentMethodController::class, 'verifyBankAccount']);
});
```

### Teacher Routes
```php
Route::middleware(['auth', 'role:teacher', 'teacher.approved'])->prefix('teacher')->group(function () {
    // Earnings
    Route::get('/earnings', [EarningsController::class, 'index']);
    Route::get('/earnings/transactions', [EarningsController::class, 'transactions']);
    Route::get('/earnings/export/{month}', [EarningsController::class, 'exportReport']);
    
    // Payouts
    Route::get('/payouts', [PayoutController::class, 'index']);
    Route::get('/payouts/create', [PayoutController::class, 'create']);
    Route::post('/payouts', [PayoutController::class, 'store']);
    Route::get('/payouts/{id}', [PayoutController::class, 'show']);
    Route::post('/payouts/{id}/cancel', [PayoutController::class, 'cancel']);
    
    // Payment Methods (Teacher)
    Route::resource('payment-methods', TeacherPaymentMethodController::class);
    Route::post('/payment-methods/{id}/set-primary', [TeacherPaymentMethodController::class, 'setPrimary']);
    Route::post('/payment-methods/verify-bank', [TeacherPaymentMethodController::class, 'verifyBankAccount']);
});
```

### Admin Routes
```php
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    // Financial Dashboard
    Route::get('/finances', [FinancialDashboardController::class, 'index']);
    
    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::post('/transactions/{id}/refund', [TransactionController::class, 'refund']);
    Route::get('/transactions/export', [TransactionController::class, 'export']);
    
    // Payouts
    Route::get('/payouts', [PayoutController::class, 'index']);
    Route::get('/payouts/{id}', [PayoutController::class, 'show']);
    Route::post('/payouts/{id}/approve', [PayoutController::class, 'approve']);
    Route::post('/payouts/{id}/reject', [PayoutController::class, 'reject']);
    Route::post('/payouts/bulk-approve', [PayoutController::class, 'bulkApprove']);
    Route::post('/payouts/{id}/process', [PayoutController::class, 'process']);
    
    // Payment Gateways
    Route::get('/payment-gateways', [PaymentGatewayController::class, 'index']);
    Route::post('/payment-gateways/paystack', [PaymentGatewayController::class, 'updatePaystack']);
    Route::post('/payment-gateways/paypal', [PaymentGatewayController::class, 'updatePayPal']);
    Route::get('/payment-gateways/{gateway}/test', [PaymentGatewayController::class, 'testConnection']);
    
    // Reports
    Route::get('/reports/revenue', [ReportsController::class, 'revenue']);
    Route::get('/reports/payouts', [ReportsController::class, 'payouts']);
    Route::get('/reports/transactions', [ReportsController::class, 'transactions']);
});
```

### Webhook Routes (Public)
```php
// No authentication middleware
Route::post('/webhooks/paystack', [PaystackWebhookController::class, 'handle']);
Route::post('/webhooks/paypal', [PayPalWebhookController::class, 'handle']);
```

---

## 📦 Models

### 1. `Wallet.php`
```php
Relationships:
- belongsTo User
- hasMany Transaction

Methods:
- credit($amount, $description, $metadata = [])
- debit($amount, $description, $metadata = [])
- getBalance()
- canDebit($amount)
```

### 2. `Transaction.php`
```php
Relationships:
- belongsTo User
- belongsTo Wallet
- morphTo Transactionable (Booking, Payout, etc.)

Scopes:
- credits()
- debits()
- completed()
- pending()
- byGateway($gateway)

Methods:
- isCredit()
- isDebit()
- markAsCompleted()
- markAsFailed()
```

### 3. `StudentPaymentMethod.php`
```php
Relationships:
- belongsTo Student

Methods:
- isCard()
- isBankAccount()
- isPayPal()
- isPrimary()
- verify()
```

### 4. `Payout.php`
```php
Relationships:
- belongsTo Teacher
- belongsTo TeacherPaymentMethod
- belongsTo User (approved_by)
- hasOne Transaction

Scopes:
- pending()
- approved()
- processing()
- completed()
- rejected()

Methods:
- approve($adminId)
- reject($reason, $adminId)
- process()
- canBeCancelled()
```

---

## 🔐 Middleware

### 1. `VerifyPaystackWebhook.php`
```php
Verifies Paystack webhook signature
```

### 2. `VerifyPayPalWebhook.php`
```php
Verifies PayPal webhook signature
```

---

## 📋 Summary by Role

### Student/Guardian Backend:
- ✅ Wallet management
- ✅ Credit wallet (Paystack/PayPal)
- ✅ Payment processing for bookings
- ✅ Save payment methods (cards, banks, PayPal)
- ✅ Transaction history
- ✅ Export reports

### Teacher Backend:
- ✅ Earnings dashboard
- ✅ Wallet management
- ✅ Request payouts
- ✅ Manage payout methods
- ✅ View payout history
- ✅ Bank verification
- ✅ Transaction history
- ✅ Export earnings reports

### Admin Backend:
- ✅ Financial overview dashboard
- ✅ All transactions management
- ✅ Payout approval queue
- ✅ Payment gateway configuration
- ✅ Refund processing
- ✅ Financial reports
- ✅ Revenue analytics
- ✅ Platform earnings tracking

---

## 🚀 Implementation Order

**Week 1: Foundation**
1. Database migrations
2. Models with relationships
3. Payment services (Paystack, PayPal)
4. Wallet service

**Week 2: Student/Guardian** 5. Student wallet & payment controllers
6. Payment method management
7. Paystack card/bank integration

**Week 3: Teacher**
8. Earnings dashboard
9. Payout request system
10. Teacher payment methods

**Week 4: Admin**
11. Financial dashboard
12. Payout approval
13. Reports & analytics

**Week 5: Testing & Polish**
14. Webhook testing
15. Integration testing
16. Error handling
17. Admin tools

---

**Ready to start building? This is the complete backend architecture!** 🎯

