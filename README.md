# IqraQuest

A modern Islamic learning platform built with Laravel, React, and Inertia.js.

## 🚀 Tech Stack

- **Backend**: Laravel (PHP)
- **Frontend**: React 19.2 with TypeScript
- **Routing**: Inertia.js 2.1
- **Styling**: Tailwind CSS 4.0
- **Build Tool**: Vite 7
- **UI Components**: Radix UI
- **Icons**: Iconify (150,000+ icons from 100+ sets)
- **State Management**: Inertia.js + React Hooks

## 📦 Installation

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IqraQuest
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Laravel server
   php artisan serve

   # Terminal 2 - Vite dev server
   npm run dev
   ```

## 🎨 Design System

### Colors
- **Primary**: `#4caf50` (Green)
- **Accent**: `#4d9b91` (Teal)
- **Landing Page**: `#317b74` (Dark Teal), `#fff7e4` (Cream)
- **Background**: `#ffffff` (Light), `#1c2a3a` (Dark)

### Typography
- **Primary Font**: Poppins (headings, body)
- **Secondary Font**: Inter (body text, buttons)
- **Landing Font**: Nunito (landing page components)

### Responsive Scaling
All components use the automated scaling formula:
```
clamp(minSize, (px / 1440) * 100vw, maxSize)
```

Example:
```tsx
// 48px heading becomes:
text-[clamp(2rem,3.33vw,4rem)]
```

## 🧩 Project Structure

```
IqraQuest/
├── app/                    # Laravel application
├── resources/
│   ├── css/
│   │   └── app.css        # Design tokens, utilities
│   ├── js/
│   │   ├── components/
│   │   │   ├── ui/        # Reusable UI components
│   │   │   └── landing/   # Landing page components
│   │   ├── pages/         # Inertia pages
│   │   ├── layouts/       # Page layouts
│   │   └── lib/           # Utilities (cn, etc.)
│   └── views/
│       └── app.blade.php  # Main template
├── public/
│   └── images/            # Static images
└── routes/                # Laravel routes
```

## 🎯 Development Guidelines

### Code Style
- **TypeScript**: All React components use TypeScript
- **Formatting**: Run `npm run format` before committing
- **Linting**: Run `npm run lint` to check for issues

### Component Patterns

**UI Components** (with CVA):
```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." }
  }
});
```

**Page Components** (with Inertia):
```tsx
import { Head, Link, usePage } from '@inertiajs/react';

export default function PageName() {
  const { auth } = usePage<SharedData>().props;
  return (
    <>
      <Head title="Page Title" />
      {/* content */}
    </>
  );
}
```

### Icons (Iconify)
```tsx
import { Icon } from '@iconify/react';

<Icon icon="mdi:home" className="h-6 w-6" />
<Icon icon="fa-solid:user" className="h-6 w-6 text-primary" />
```

Browse icons at: https://icon-sets.iconify.design/

### Responsive Design
Use `clamp()` for fluid scaling:
```tsx
// Typography
text-[clamp(1rem,2vw,1.5rem)]

// Spacing
px-[clamp(1rem,5vw,5rem)]
gap-[clamp(0.5rem,2vw,2rem)]

// Containers
<div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
php artisan serve        # Start Laravel server

# Build
npm run build            # Build for production
npm run build:ssr        # Build with SSR

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run types            # Type check with TypeScript
```

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `resources/css/app.css`:
- Design tokens (colors, fonts, spacing)
- Custom utility classes
- Dark mode support

### TypeScript
Type checking enabled with strict mode. Types located in `resources/js/types/`.

## 🌙 Dark Mode

Toggle dark mode by adding `.dark` class to root element:
```tsx
// Tailwind classes automatically adapt
<div className="bg-white dark:bg-[#1c2a3a]">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>
```

## 📚 Documentation

- **Coding Rules**: See `coding_rules.md` for comprehensive guidelines
- **Design System**: Defined in `resources/css/app.css`
- **Figma Designs**: [Link to Figma project]

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting: `npm run lint && npm run format`
4. Commit with descriptive messages
5. Create a pull request

## 📄 License

[Your License Here]

## 🔗 Links

- **Iconify Icons**: https://icon-sets.iconify.design/
- **Tailwind CSS**: https://tailwindcss.com/
- **Inertia.js**: https://inertiajs.com/
- **React**: https://react.dev/

---

## 💰 Payment & Financial System

### Teacher Earnings & Payouts
- ✅ **Teacher Earnings Dashboard**
  - Real-time earnings statistics
  - Transaction history with filtering
  - Available balance tracking
  - Payout history with status tracking
  
- ✅ **Manual Payout System**
  - Request payouts with minimum threshold validation
  - Bank account verification requirement
  - Daily payout limit (once per 24 hours)
  - Multi-payment method support (Bank Transfer, PayPal)
  - Payout status tracking (pending, approved, processing, completed, failed)

- ✅ **Instant Auto-Payout System** 🆕
  - Automatic payout trigger when balance crosses threshold
  - Queue-based processing (non-blocking)
  - Daily rate limiting (manual + auto combined)
  - Database locks prevent race conditions
  - Retry logic for failed payouts (3 attempts with backoff)
  - Real-time notifications for teachers and admins

- ✅ **Payment Method Management**
  - Add/edit/delete payment methods
  - Bank account verification
  - PayPal integration
  - Support for multiple currencies (NGN, USD, EUR, GBP)

### Student Wallet System
- ✅ **Wallet Dashboard**
  - Balance tracking
  - Transaction history
  - Top-up functionality
  - Payment history

- ✅ **Payment Integration**
  - Paystack integration for card payments
  - PayPal support
  - Secure payment processing
  - Automatic wallet crediting

### Commission & Platform Earnings
- ✅ **Dynamic Commission System**
  - Configurable commission rates (percentage or fixed amount)
  - Platform earnings tracking
  - Commission applied to all booking payments
  
- ✅ **Commission Types**
  - Fixed percentage (e.g., 10% platform fee)
  - Fixed amount per transaction

### Admin Payment Management Panel
- ✅ **Teacher Payouts Tab**
  - View all payout requests
  - Filter by status, date range, teacher
  - Approve/reject payouts
  - Detailed payout view with:
    - Request details
    - Payment method information
    - Teacher information
    - Action history
    - Gateway response tracking
  
- ✅ **Student Payments Tab**
  - View all student transactions
  - Filter by plan type, payment method, user type, currency
  - Transaction details with status
  - Export capabilities

- ✅ **Payment Settings Tab**
  - Configure commission rates and type
  - Set auto-payout threshold
  - Set minimum withdrawal amount
  - Toggle bank verification requirement
  - Apply time configuration

- ✅ **Platform Earnings Dashboard**
  - Total earnings tracking
  - Commission breakdown
  - Revenue analytics

### Notification System
- ✅ **Auto-Payout Notifications**
  - Teacher success notifications (payout processed)
  - Admin failure notifications (payout failed)
  - Database + Broadcast channels
  - Real-time notification dropdown

### Payment Gateways
- ✅ **Paystack Integration**
  - Card payments
  - Bank transfers
  - Automated payouts
  - Webhook handling for payment status updates
  
- ✅ **PayPal Integration** (Partial)
  - Payment method support
  - Ready for payout implementation

### Queue System
- ✅ **Laravel Queue Configuration**
  - Database driver for job processing
  - Dedicated `payouts` queue
  - Failed job tracking
  - Automatic retry mechanism

**Configuration Required:**
```env
# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# Queue
QUEUE_CONNECTION=database

# Payment Settings (configurable via admin panel)
```

**Queue Worker:**
```bash
# Start queue worker for auto-payouts
php artisan queue:work --queue=payouts

# Monitor failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

---

## 📋 Development Log

### Recent Updates

#### 2025-12-09 - Payment & Financial System 🆕
- ✅ **Complete Teacher Earnings & Payout System**
  - Teacher earnings dashboard with statistics
  - Manual payout requests with daily limit (24-hour cooldown)
  - Bank verification requirement
  - Multi-payment method support (Bank, PayPal)
  - Payout status workflow (pending → approved → processing → completed/failed)
- ✅ **Instant Auto-Payout Implementation**
  - Automatic payout trigger when balance crosses threshold
  - Queue-based processing with retry logic (3 attempts)
  - Database locks prevent race conditions
  - Daily rate limiting (manual + auto combined)
  - Notification system for teachers and admins
- ✅ **Admin Payment Management Panel**
  - Teacher payouts tab (approve/reject payouts)
  - Student payments tab with advanced filtering
  - Payment settings tab (commission, thresholds, verification)
  - Platform earnings dashboard
- ✅ **Dynamic Commission System**
  - Configurable commission rates (percentage or fixed)
  - Applied automatically to all booking payments
  - Platform earnings tracking
- ✅ **Student Wallet System**
  - Wallet dashboard with balance tracking
  - Top-up functionality via Paystack
  - Transaction history with filtering
- ✅ **Payment Gateway Integration**
  - Paystack: Card payments, bank transfers, automated payouts
  - PayPal: Payment method support (ready for implementation)
  - Webhook handling for status updates
- ✅ **Notification System**
  - Teacher notifications on successful auto-payout
  - Admin notifications on failed auto-payout
  - Database + Broadcast channels configured
- ✅ **Critical Bug Fixes**
  - Fixed fake success simulation for failed Paystack transfers
  - Fixed notification code placement in transaction flow
  - Proper exception handling for gateway failures

#### 2025-12-03 - Authentication & Social Login
- ✅ **Implemented Social Login with Laravel Socialite**
  - Google OAuth integration
  - Facebook OAuth integration
  - Automatic email verification for social accounts
  - Role-based registration flow (Teacher vs Student/Guardian)
  - Stateless OAuth to preserve role parameters during redirects
- ✅ **OTP Email Verification System**
  - Alternative to traditional email verification links
  - 6-digit OTP with 10-minute expiration
  - Configurable via `.env` (`EMAIL_VERIFICATION_METHOD=otp` or `link`)
  - Auto-resend functionality with countdown timer
  - Rate limiting and security features
- ✅ **Enhanced Authentication Security**
  - IP blocking for suspicious login attempts
  - Login attempt tracking and notifications
  - Session configuration optimized for OAuth (`SameSite=lax`)
  - Strong password requirements (12+ chars, complexity rules)
  - Consistent password validation across all registration flows
- ✅ **Multi-Role Registration System**
  - Separate registration flows for Teachers and Students/Guardians
  - Role selection page for Student/Guardian accounts
  - Automated profile creation based on user role
  - Email verification integration with role-based redirects

#### 2025-11-27
- ✅ Implemented responsive Navbar component with Figma design
- ✅ Applied automated scaling system using `clamp()` formulas
- ✅ Integrated Iconify for icon management (150,000+ icons)
- ✅ Created comprehensive coding rules documentation
- ✅ Set up Figma → Tailwind conversion guidelines
- ✅ **Added fully responsive mobile navigation**
  - Hamburger menu icon with smooth animations
  - Slide-in mobile menu drawer (300ms transition)
  - Backdrop overlay with blur effect
  - Icon-enhanced menu items (mdi icons)
  - Active state indicators
  - Hover effects and transitions

#### Component Updates
- **Navbar.tsx**: Fully responsive with mobile menu
  - Desktop: Horizontal navigation with hover underline animations
  - Mobile: Slide-in drawer menu from right side
  - Hamburger icon toggles between menu/close (Iconify)
  - Smooth 300ms transitions
  - Backdrop overlay on mobile menu open
  - Icons for each menu item (Home, About, Features, Contact)
  - Responsive sizing with `clamp()` values

#### Design System
- Established automated scaling formula: `clamp(min, px/1440*100vw, max)`
- Defined responsive defaults for typography, spacing, and components
- Integrated Nunito, Poppins, and Inter fonts

---

## 🔐 Authentication Features

### Social Login
Users can register and login using:
- **Google** - OAuth 2.0 integration
- **Facebook** - OAuth 2.0 integration

**Configuration Required:**
Add credentials to `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"

FACEBOOK_CLIENT_ID=your-client-id
FACEBOOK_CLIENT_SECRET=your-client-secret
FACEBOOK_REDIRECT_URI="${APP_URL}/auth/facebook/callback"
```

### Email Verification Methods

**Option 1: Traditional Link (default)**
```env
EMAIL_VERIFICATION_METHOD=link
```

**Option 2: OTP System**
```env
EMAIL_VERIFICATION_METHOD=otp
OTP_EXPIRY_MINUTES=10
```

### Security Features
- IP-based login attempt tracking
- Automatic IP blocking after failed attempts
- Email notifications for suspicious activity
- Strong password enforcement (12+ characters, complexity)
- Session security optimized for OAuth flows

---

**Built with ❤️ for Islamic education**
