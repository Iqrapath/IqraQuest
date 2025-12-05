# IqraQuest Payment Gateway Strategy

**Final Implementation Plan - 2 Gateways Only**

---

## 🎯 Strategic Gateway Selection

We use **2 payment gateways** for maximum simplicity:

| Gateway | Role | What It Handles |
|---------|------|-----------------|
| **Paystack** | Primary - Everything | Cards, Banks, Verification, Payouts |
| **PayPal** | Optional Alternative | PayPal accounts (user preference) |

**That's it. Simple. Clean. Powerful.**

---

## 🏦 Gateway #1: Paystack - Does Everything

### Role: **Primary gateway for ALL payment operations**

### For Students
**What Paystack Handles:**
- ✅ **Debit/Credit Cards** (Nigerian Verve, Visa, Mastercard, International cards)
- ✅ **Bank Transfers** (Virtual Accounts - one-time payments)
- ✅ **Direct Bank Debit** (Saved bank accounts - recurring)
- ✅ **Bank Account Verification** (for students/guardians and teachers)
- ✅ **Card Verification** (before saving cards)

**Payment Methods Available:**
1. **Pay with Card** → Instant confirmation
2. **Pay via Bank Transfer** → 5-10 minutes (virtual account)
3. **Link Bank Account** → Direct debit for future payments

**Use Cases:**
1. Student pays with card (Nigerian or International)
2. Student credits wallet via bank transfer
3. Student links bank account for quick payments
4. Platform verifies student/teacher bank details

**Payment Flow (Card):**
```
1. Student selects "Pay with Card"
2. Paystack popup appears
3. Student enters card details
4. OTP/3D Secure if required
5. Payment confirmed instantly ✓
```

**Payment Flow (Bank Transfer):**
```
1. Student selects "Bank Transfer"
2. Paystack creates virtual account
   ├── Bank: Wema Bank
   ├── Account: 9876543210
   └── Valid: 24 hours
3. Student transfers from their bank app
4. Paystack webhook confirms (5-10 mins)
5. Wallet credited ✓
```

**Payment Flow (Direct Debit - Saved Bank):**
```
1. Student links bank account (one-time authorization)
2. Future payments: Click "Pay with Saved Bank"
3. Paystack charges instantly
4. Payment confirmed ✓
```

**Why Paystack for Everything?**
- Handles cards AND banks in one integration
- Best Nigerian payment infrastructure
- Lower fees than international gateways
- Reliable API and webhooks
- One gateway = simpler codebase

---

### For Teachers
**Payout Method:**
- ✅ Nigerian Bank Account Payouts (via Paystack Transfer API)

**Bank Verification:**
```
Teacher enters bank details → Paystack API verifies
Returns: "JOHN DOE" → Teacher confirms → Verified ✓
```

**Payout Speed:** Same day or next business day

**Why Paystack for Payouts?**
- Instant bank account verification
- Fast transfers to Nigerian banks
- Reliable Transfer API
- Low fees

---

## � Gateway #2: PayPal - Optional Alternative

### Role: **For users who prefer PayPal**



### For Students
**What PayPal Handles:**
- ✅ **PayPal Account Payments** (use PayPal balance)
- ✅ **PayPal-linked Cards** (cards saved in PayPal)
- ✅ **International Payments**

**Use Cases:**
1. Student has PayPal account with balance
2. Student prefers PayPal's buyer protection
3. Student doesn't want to enter card on platform

**Payment Flow:**
```
1. Student selects "PayPal"
2. Redirects to PayPal login
3. Student authorizes payment
4. Returns to platform
5. Payment confirmed ✓
```

**Why PayPal?**
- User preference (some trust PayPal more)
- Buyer protection
- No need to share card details with platform
- Good for international students

---

### For Teachers
**Payout Method:**
- ✅ PayPal Email Payouts (optional)

**Setup:**
```
Teacher enters PayPal email → Verified → Ready ✓
```

**Payout Speed:** Same day to 1 business day

---

---

## 📊 Gateway Decision Flow

### For Student Payments

```
What payment method does student choose?

1. DEBIT/CREDIT CARD
   └── Use PAYSTACK
       └── Card processing + verification
       └── Instant confirmation

2. BANK TRANSFER
   └── Use PAYSTACK
       └── Virtual account created
       └── 5-10 minute confirmation

3. SAVED BANK ACCOUNT (Direct Debit)
   └── Use PAYSTACK
       └── One-time authorization
       └── Instant future payments

4. PAYPAL ACCOUNT
   └── Use PAYPAL
       └── PayPal balance or linked cards
       └── Redirect to PayPal
```

### For Teacher Payouts

```
What payout method did teacher choose?

1. NIGERIAN BANK ACCOUNT
   └── Use PAYSTACK
       └── Transfer API to Nigerian banks
       └── Same day or next business day

2. PAYPAL EMAIL
   └── Use PAYPAL
       └── PayPal Payouts API
       └── Same day to 1 business day
```

---

## 🎯 Clear Role Separation

| Payment Type | Gateway Used | Why |
|--------------|-------------|-----|
| **Student pays with card** | **Paystack** | Handles all cards (Nigerian + International) |
| **Student pays via bank transfer** | **Paystack** | Virtual accounts, best Nigerian banks |
| **Student saves bank for quick pay** | **Paystack** | Direct debit authorization |
| **Student prefers PayPal** | **PayPal** | User choice, buyer protection |
| **Verify any bank account** | **Paystack** | Best verification API |
| **Teacher payout (Nigerian bank)** | **Paystack** | Fast local transfers, same/next day |
| **Teacher payout (PayPal)** | **PayPal** | Optional, PayPal email payouts |

**2 Gateways. Maximum simplicity. Zero overlap.**

---

## 💰 Fee Comparison

### Student Paying ₦20,000

| Gateway | Fee | Platform Gets | Use Case |
|---------|-----|--------------|----------|
| **Paystack** | 1.5% + ₦100 = ₦400 | ₦19,600 | Nigerian cards/bank |
| **Flutterwave** | 1.4% + ₦100 = ₦380 | ₦19,620 | African bank transfers |
| **Stripe** | 3.9% + ₦100 = ₦880 | ₦19,120 | International cards |

### Teacher Payout ₦100,000

| Gateway | Fee | Teacher Gets | Use Case |
|---------|-----|-------------|----------|
| **Paystack** | ₦50-100 | ₦99,900+ | Nigerian banks |
| **Flutterwave** | ₦100-200 | ₦99,800+ | Other African banks |

---

## 🚀 Implementation Priority

### Week 1: Paystack (Everything)
- ✅ Card payments (Nigerian + International cards)
- ✅ Virtual accounts (bank transfers)
- ✅ Direct bank debit
- ✅ Bank verification API
- ✅ Card verification
- ✅ Teacher bank payouts
- ✅ Webhooks

**Why First?** Handles 95% of all transactions. Get this working and you're operational.

### Week 2: PayPal (Optional)
- ✅ PayPal checkout integration
- ✅ PayPal payouts for teachers
- ✅ Webhooks

**Why Second?** Nice-to-have alternative for users who prefer PayPal.

### Week 3: Polish & Testing
- Integration testing
- Webhook testing
- Error handling
- Admin dashboard

---

## ✅ Benefits of 2-Gateway Approach

**Simplicity:**
- ✅ Only 2 integrations to maintain
- ✅ Simpler codebase
- ✅ Easier testing
- ✅ Fewer API keys to manage

**Coverage:**
- ✅ Nigerian cards → Paystack
- ✅ International cards → Paystack
- ✅ Bank transfers → Paystack
- ✅ PayPal users → PayPal
- ✅ Nigerian payouts → Paystack
- ✅ PayPal payouts → PayPal

**Reliability:**
- ✅ Paystack is the most reliable in Nigeria
- ✅ PayPal is globally trusted
- ✅ No need for fallbacks (Paystack is very stable)

---

## 🚦 Ready to Build?

**Next Steps:**
1. ✅ Sign up for Paystack account
2. ✅ Sign up for PayPal Business account
3. ✅ Get test API keys
4. ✅ Install composer packages:
   ```bash
   composer require yabacon/paystack-php
   composer require paypal/paypal-checkout-sdk
   ```
5. ✅ Build Paystack service (Week 1)
6. ✅ Build PayPal service (Week 2)

**Start with Paystack = 95% functionality immediately!**

Let's build! 🚀

---

## 🔧 Configuration Summary

###Environment Variables Needed

```env
# Paystack (Primary - Everything)
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_WEBHOOK_SECRET=xxxxx

# PayPal (Optional Alternative)
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_WEBHOOK_ID=xxxxx

# Payment Settings
PLATFORM_COMMISSION_PERCENTAGE=15
MINIMUM_PAYOUT_AMOUNT=5000
DEFAULT_CURRENCY=NGN
```

**That's it! Just 2 integrations to maintain.**

---

## 🎛️ Admin Controls

Admin can enable/disable gateways per region:

```
Settings → Payment Gateways

Nigeria:
  ✅ Paystack (Primary)
  ✅ Flutterwave (Backup for bank transfers)
  ❌ Stripe (Not needed for local)

Kenya:
  ❌ Paystack (Not supported)
  ✅ Flutterwave (Primary)
  ✅ Stripe (International cards)

International:
  ❌ Paystack (Not supported)
  ❌ Flutterwave (Not supported)
  ✅ Stripe (Only option)
```

---

## 📱 User Experience

### Student at Checkout Sees:

**Nigerian Student:**
```
Choose Payment Method:
● Debit/Credit Card (Instant) - Paystack
○ Bank Transfer (5-10 mins) - Paystack
○ Direct Bank Debit - Flutterwave
```

**Kenyan Student:**
```
Choose Payment Method:
● M-Pesa (Instant) - Flutterwave
○ Debit/Credit Card - Flutterwave
○ Bank Transfer - Flutterwave
```

**US Student:**
```
Choose Payment Method:
● Credit/Debit Card (Visa, Mastercard) - Stripe
```

---

## ✅ Final Decision Summary

**3 Gateways. 3 Clear Roles. No Overlap.**

1. **Paystack** = Nigeria everything (cards, bank, payouts)
2. **Flutterwave** = Africa expansion + Bank specialist
3. **Stripe** = International cards only

**Each gateway has a specific job. No redundancy. Maximum coverage.**

---

## 🚦 Ready to Build?

**Next Steps:**
1. ✅ Set up accounts with all 3 gateways
2. ✅ Get API keys (test mode first)
3. ✅ Install composer packages
4. ✅ Build service classes
5. ✅ Implement Paystack first (Week 1)
6. ✅ Add Flutterwave (Week 2)
7. ✅ Add Stripe (Week 3)

**Start with Paystack = Immediate value for Nigerian users.**

Let's build! 🚀
