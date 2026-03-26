# IqraQuest

<div align="center">

**A Modern Islamic Learning Platform Connecting Students with Qualified Quran Teachers**

[![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.1-9553E9)](https://inertiajs.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Key Systems](#-key-systems)
- [Design System](#-design-system)
- [Development Guidelines](#-development-guidelines)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Development Log](#-development-log)
- [License](#-license)

---

## 🌟 Overview

IqraQuest is a comprehensive e-learning platform designed specifically for Islamic education, connecting students and guardians with qualified Quran teachers worldwide. The platform provides live video classrooms, flexible scheduling, secure payment processing, AI-powered teacher matching, and a complete learning management system.

### 🎯 Mission
To make quality Islamic education accessible to everyone, everywhere, through modern technology and experienced teachers.

### 👥 User Roles
- **Students**: Book sessions, attend live classes, track progress, manage wallet
- **Guardians**: Manage multiple children, oversee learning, make payments
- **Teachers**: Conduct classes, manage availability, track earnings, request payouts
- **Admins**: Platform management, teacher approval, financial oversight, analytics

---

## ✨ Features

### 🎓 Core Learning Features
- **Live Video Classrooms** - High-quality video/audio sessions powered by LiveKit
- **Interactive Whiteboard** - Real-time collaboration tools during lessons
- **Session Recording** - Automatic recording of classes for review
- **Attendance Tracking** - Automated attendance logging for all sessions
- **Progress Reports** - Detailed learning analytics and progress tracking
- **Certificate Management** - Teacher credential verification and display
- **Quran Tools** - Integrated Quran player and canvas for teaching

### 📅 Booking & Scheduling
- **Flexible Scheduling** - Book sessions based on teacher availability
- **Recurring Bookings** - Set up weekly/monthly recurring sessions
- **Reschedule Requests** - Easy rescheduling with teacher approval
- **Session Reminders** - Automated email and push notifications
- **Calendar Integration** - Export to Google Calendar, iCal
- **Time Zone Support** - Automatic timezone conversion

### 💰 Financial System
- **Multi-Gateway Payments** - Paystack (cards, bank transfers) & PayPal
- **Digital Wallets** - Secure wallet system for students and teachers
- **Auto-Payout System** - Automatic teacher payouts when threshold reached
- **Commission Management** - Configurable platform commission (percentage/fixed)
- **Escrow System** - Funds held until session completion
- **Transaction History** - Detailed financial records with export functionality
- **Multi-Currency Support** - NGN, USD, EUR, GBP

### 👤 User Management
- **Multi-Role Authentication** - Role-based access control (RBAC)
- **Social Login** - Google & Facebook OAuth integration
- **OTP Verification** - Secure 6-digit OTP email verification
- **Two-Factor Authentication** - Enhanced account security with 2FA
- **Profile Management** - Comprehensive user profiles with media upload
- **Guardian Dashboard** - Manage multiple children from one account
- **Teacher Verification** - Certificate verification and approval workflow

### 💬 Communication
- **Real-Time Messaging** - In-platform chat between students and teachers
- **Typing Indicators** - Real-time typing status
- **Read Receipts** - Message delivery confirmation
- **Admin Broadcasts** - Platform-wide announcements
- **Session Chat** - In-classroom messaging during live sessions

### ⭐ Reviews & Ratings
- **Student Reviews** - Rate and review teachers after sessions
- **Guardian Oversight** - Guardians can view all children's reviews
- **Teacher Feedback** - Teachers can rate student attendance and participation
- **Review Management** - Edit and reply to reviews
- **Rating Analytics** - Aggregated ratings and performance metrics

### 🤖 AI-Powered Features
- **Teacher Matching** - Google Gemini AI for personalized teacher recommendations
- **Match Scoring** - Detailed compatibility scores with AI reasoning
- **Smart Recommendations** - Subject, schedule, and preference-based matching

### 🔒 Security Features
- **IP-Based Login Tracking** - Monitor and block suspicious login attempts
- **Session Management** - Secure session handling with expiration
- **Password Policy** - Strong password requirements (12+ chars)
- **Bank Account Verification** - Paystack integration for verifying bank details
- **Webhook Security** - Signed webhooks for payment gateway callbacks

---

## 🚀 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **PHP** | 8.2+ | Server-side language |
| **Laravel** | 12.0 | Application framework |
| **Inertia.js** | 2.1 | Modern SPA framework |
| **Laravel Fortify** | 1.30 | Authentication backend |
| **Laravel Socialite** | 5.23 | OAuth integration |
| **Laravel Reverb** | 1.0 | WebSocket server |
| **Laravel Queue** | Database | Background job processing |
| **DomPDF** | 3.1 | PDF generation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2 | UI library |
| **TypeScript** | 5.7 | Type safety |
| **Tailwind CSS** | 4.0 | Utility-first CSS |
| **Vite** | 7.0 | Build tool |
| **Radix UI** | Latest | Headless UI components |
| **LiveKit** | 2.9.17 | Video conferencing |
| **Iconify** | 6.0 | Icon library (150k+ icons) |
| **Lucide React** | 0.475 | Additional icons |
| **TanStack Table** | 8.21 | Advanced data tables |
| **Recharts** | 3.5 | Data visualization |
| **CVA** | 0.7.1 | Component variants |

### Payment Gateways
- **Paystack** - Primary gateway (cards, bank transfers, payouts)
- **PayPal** - Alternative payment method

### Third-Party Services
- **LiveKit** - Video/audio communication infrastructure
- **Google Gemini** - AI-powered teacher matching
- **Bunny Fonts** - Font CDN (Poppins, Inter, Nunito)

---

## 🏗️ Architecture

### System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         IqraQuest Platform                        │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐      │
│  │   Students   │────▶│   Guardians  │────▶│   Teachers   │      │
│  └──────────────┘     └──────────────┘     └──────────────┘      │
│         │                     │                     │            │
│         └─────────────────────┼─────────────────────┘            │
│                               │                                  │
│                        ┌──────────────┐                          │
│                        │   Laravel    │                          │
│                        │   Backend    │                          │
│                        └──────────────┘                          │
│                               │                                  │
│         ┌─────────────────────┼─────────────────────┐            │
│         │                     │                     │            │
│    ┌────────────┐      ┌────────────┐      ┌────────────┐        │
│    │  Database  │      │   Reverb   │      │  LiveKit   │        │
│    │  (MySQL)   │      │ WebSockets │      │   Video    │        │
│    └────────────┘      └────────────┘      └────────────┘        │
│         │                                         │              │
│    ┌────────────────────────────────────────────────────┐        │
│    │            React + Inertia.js Frontend             │        │
│    └────────────────────────────────────────────────────┘        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Database Schema Overview

**Core Tables:**
- `users` - All system users (students, guardians, teachers, admins)
- `students`, `guardians`, `teachers` - Role-specific profile data
- `bookings` - Session bookings with scheduling information
- `conversations`, `messages` - Real-time messaging system
- `wallets`, `transactions` - Financial system
- `payouts` - Teacher payout requests and processing
- `reviews` - Student/teacher reviews and ratings
- `teacher_certificates` - Teacher qualification documents

**Supporting Tables:**
- `teacher_availability` - Teacher schedule management
- `classroom_attendance` - Session attendance records
- `classroom_materials` - Lesson resources and files
- `classroom_polls` - Interactive classroom polls
- `notifications` - Multi-channel notification system
- `security_logs`, `login_attempts` - Security tracking
- `match_requests` - AI teacher matching requests

---

## 📦 Installation

### Prerequisites
- **PHP** 8.2 or higher
- **Composer** 2.0+
- **Node.js** 18+ and npm/yarn
- **MySQL** 8.0+ or **PostgreSQL** 13+
- **Redis** (optional, recommended for production)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/iqraquest.git
cd iqraquest
```

### Step 2: Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### Step 3: Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Database Setup
```bash
# Create database (MySQL example)
mysql -u root -p -e "CREATE DATABASE iqraquest;"

# Run migrations
php artisan migrate

# Seed database with demo data (optional)
php artisan db:seed
```

### Step 5: Storage Setup
```bash
# Create symbolic link for storage
php artisan storage:link
```

### Step 6: Start Development Servers

**Option 1: Using Composer Script (Recommended)**
```bash
composer dev
# Runs: Laravel server + Queue worker + Vite dev server
```

**Option 2: Manual (3-4 terminals)**
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Queue worker
php artisan queue:work --queue=payouts,default --tries=3

# Terminal 3: Vite dev server
npm run dev

# Terminal 4: Laravel Reverb (WebSockets)
php artisan reverb:start
```

---

## 🔧 Configuration

### Environment Variables

#### Application Settings
```env
APP_NAME="IqraQuest"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

#### Database
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iqraquest
DB_USERNAME=root
DB_PASSWORD=
```

#### Queue & Broadcasting
```env
QUEUE_CONNECTION=database
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

#### Email Verification
```env
EMAIL_VERIFICATION_METHOD=otp  # or 'link'
OTP_EXPIRY_MINUTES=10
```

#### OAuth - Social Login
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"

FACEBOOK_CLIENT_ID=your-app-id
FACEBOOK_CLIENT_SECRET=your-app-secret
FACEBOOK_REDIRECT_URI="${APP_URL}/auth/facebook/callback"
```

#### Payment Gateway - Paystack
```env
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxx
```

#### Payment Gateway - PayPal
```env
PAYPAL_MODE=sandbox  # or 'live'
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_WEBHOOK_ID=xxxxx
```

#### LiveKit (Video Conferencing)
```env
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_HOST=wss://your-livekit-server.com
```

#### Google Gemini (AI Matching)
```env
GEMINI_API_KEY=your-gemini-api-key
```

#### Payment Settings (Managed via Admin Panel)
```env
PLATFORM_COMMISSION_PERCENTAGE=15
PLATFORM_COMMISSION_TYPE=percentage  # or 'fixed'
MINIMUM_PAYOUT_AMOUNT=5000
AUTO_PAYOUT_THRESHOLD=10000
DEFAULT_CURRENCY=NGN
```

---

## 📁 Project Structure

```
IqraQuest/
├── app/
│   ├── Actions/              # Laravel Fortify actions
│   ├── Console/Commands/     # Artisan commands
│   ├── Constants/            # Application constants (permissions)
│   ├── Enums/                # PHP enums (UserRole, etc.)
│   ├── Events/               # Laravel events (broadcasting)
│   ├── Http/
│   │   ├── Controllers/      # Application controllers
│   │   │   ├── Admin/        # Admin controllers
│   │   │   ├── Auth/         # Authentication controllers
│   │   │   ├── Guardian/     # Guardian controllers
│   │   │   ├── Student/      # Student controllers
│   │   │   ├── Teacher/      # Teacher controllers
│   │   │   ├── Settings/     # Settings controllers
│   │   │   └── Webhooks/     # Payment webhooks
│   │   ├── Middleware/       # Custom middleware
│   │   └── Requests/         # Form request validation
│   ├── Jobs/                 # Queue jobs
│   │   ├── ProcessAutoPayoutJob.php
│   │   └── ProcessBookingPaymentJob.php
│   ├── Listeners/            # Event listeners
│   ├── Mail/                 # Email templates
│   ├── Models/               # Eloquent models (35+)
│   ├── Notifications/        # Notification classes (40+)
│   ├── Observers/            # Model observers
│   ├── Providers/            # Service providers
│   ├── Services/             # Business logic services
│   │   ├── Payment/          # Payment gateway services
│   │   ├── BookingService.php
│   │   ├── WalletService.php
│   │   ├── PayoutService.php
│   │   ├── LiveKitService.php
│   │   └── TeacherMatchingService.php
│   └── Traits/               # Reusable traits
├── config/                   # Configuration files
├── database/
│   ├── factories/            # Model factories
│   ├── migrations/           # Database migrations (38+)
│   └── seeders/              # Database seeders
├── public/
│   └── images/               # Public images
├── resources/
│   ├── css/
│   │   └── app.css           # Tailwind CSS + Design tokens
│   ├── js/
│   │   ├── components/       # React components (158+)
│   │   │   ├── ui/           # Reusable UI components (37)
│   │   │   ├── landing/      # Landing page components
│   │   │   ├── Layout/       # Layout components
│   │   │   └── ...           # Feature-specific components
│   │   ├── layouts/          # Page layouts (6)
│   │   ├── pages/            # Inertia.js pages (100+)
│   │   │   ├── Admin/        # Admin pages
│   │   │   ├── Auth/         # Authentication pages
│   │   │   ├── Classroom/    # Live classroom
│   │   │   ├── Guardian/     # Guardian pages
│   │   │   ├── Student/      # Student pages
│   │   │   └── Teacher/      # Teacher pages
│   │   ├── lib/              # Utility functions
│   │   └── types/            # TypeScript definitions
│   └── views/
│       └── app.blade.php     # Main blade template
├── routes/
│   ├── web.php               # Public routes
│   ├── admin.php             # Admin routes
│   ├── teacher.php           # Teacher routes
│   ├── student.php           # Student routes
│   ├── guardian.php          # Guardian routes
│   ├── settings.php          # Settings routes
│   └── channels.php          # Broadcast channels
├── tests/                    # Test files
├── .env.example              # Environment template
├── composer.json             # PHP dependencies
├── package.json              # Node dependencies
└── vite.config.ts            # Vite configuration
```

---

## 🔑 Key Systems

### 1. Authentication System

**Features:**
- Multi-role authentication (Student, Guardian, Teacher, Admin)
- Social login (Google, Facebook)
- OTP email verification (6-digit, 10-minute expiry)
- Traditional email verification link
- Two-factor authentication (2FA) with QR codes
- IP-based login tracking
- Automatic IP blocking for suspicious activity
- Password policy enforcement (12+ characters, complexity)

### 2. Booking System

**Features:**
- Search and filter teachers
- Real-time availability calendar
- One-time or recurring sessions
- Automatic timezone conversion
- Session reminders (email + push notifications)
- Reschedule requests with approval workflow
- Cancellation with refund processing
- Calendar export (Google Calendar, iCal)

**Booking Flow:**
1. Student/Guardian selects teacher and time slot
2. System checks availability
3. Payment processed (via wallet or direct payment)
4. Booking confirmed
5. Reminders sent before session
6. Session conducted
7. Funds released to teacher (after completion)
8. Review/rating opportunity

### 3. Live Classroom System (The Majlis)

**Features:**
- HD video/audio conferencing (LiveKit)
- Screen sharing
- Interactive whiteboard
- Real-time chat
- Session recording
- Attendance tracking
- Polls and quizzes
- File/material sharing
- Quran player with synchronized playback
- Quran canvas for annotations

### 4. Payment & Financial System

**Architecture:**
```
Student Pays → Wallet Credited → Booking Confirmed →
Session Completed → Teacher Earnings → Auto/Manual Payout →
Bank/PayPal Transfer
```

**Student/Guardian Wallet:**
- Digital wallet with transaction history
- Multiple payment methods (cards, bank transfer, PayPal)
- Save payment methods for quick checkout
- Multi-currency support

**Teacher Earnings & Payouts:**
- Real-time earnings dashboard
- Available balance tracking
- Manual payout requests (daily limit, minimum threshold)
- Auto-payout system (triggers at configurable threshold)
- Multiple payout methods (bank transfer, PayPal)
- Bank account verification
- Retry logic for failed payouts (3 attempts)

**Admin Financial Management:**
- Complete financial dashboard
- Payout approval queue
- Commission management (percentage/fixed)
- Revenue analytics
- Transaction monitoring

### 5. Guardian Management System

**Features:**
- Multi-step onboarding process (2 steps)
- Manage multiple children from one account
- Create login credentials for each child
- Aggregated dashboard (all children's data)
- Unified payment management
- Combined review and rating management
- Family-oriented notifications

### 6. Teacher Verification System

**4-Step Onboarding:**
1. Personal information
2. Teaching experience and certifications
3. Subjects and availability
4. Payment details

**Verification Process:**
- Document verification
- Video interview with admin
- Certificate validation
- Approval/rejection with feedback

### 7. AI Teacher Matching

**Features:**
- Gemini AI Integration for intelligent matching
- Preference-Based matching (subject, time, learning goals)
- Fallback scoring algorithm if AI unavailable
- Match request tracking and history

---

## 🎨 Design System

### Colors

**Primary Palette:**
- Primary: `#4caf50` (Green)
- Accent: `#4d9b91` (Teal)
- Landing: `#317b74` (Dark Teal), `#fff7e4` (Cream)
- Background: `#ffffff` (Light), `#1c2a3a` (Dark)

**Semantic Colors:**
- Success: `#93c19e`
- Warning: `#fdba74`
- Error: `#ef4444`
- Info: `#3b82f6`

### Typography

**Font Families:**
- **Poppins**: Headings, body text
- **Inter**: Body text, buttons
- **Nunito**: Landing page components

**Responsive Scaling:**
All typography uses the automated scaling formula:
```
clamp(minSize, (px / 1440) * 100vw, maxSize)
```

Example:
```tsx
// 48px heading becomes:
className="text-[clamp(2rem,3.33vw,4rem)]"

// 32px padding becomes:
className="px-[clamp(0.5rem,2.22vw,2rem)]"
```

### Dark Mode

Toggle dark mode with `.dark` class on root element:
```tsx
<div className="bg-white dark:bg-[#1c2a3a]">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>
```

---

## 💻 Development Guidelines

### Code Style
- **Backend**: Follow PSR-12 coding standard (Laravel Pint)
- **Frontend**: ESLint + Prettier configuration
- **TypeScript**: Strict mode enabled
- **Commits**: Conventional commits format (feat, fix, docs, etc.)

### Component Patterns

**UI Components (with CVA):**
```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "...", lg: "..." }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
```

**Page Components (with Inertia):**
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

### Icons

**Iconify (Primary):**
```tsx
import { Icon } from '@iconify/react';

<Icon icon="mdi:home" className="h-6 w-6" />
<Icon icon="fa-solid:user" className="h-6 w-6 text-primary" />
```

Browse 150,000+ icons: https://icon-sets.iconify.design/

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server with HMR
php artisan serve        # Start Laravel development server
php artisan queue:work   # Process background jobs
php artisan reverb:start # Start WebSocket server
composer dev             # Run all servers concurrently

# Build
npm run build            # Build for production
npm run build:ssr        # Build with server-side rendering

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run types            # TypeScript type checking

# Database
php artisan migrate      # Run migrations
php artisan migrate:fresh --seed  # Fresh migration with seeds

# Queue Management
php artisan queue:work --queue=payouts  # Process payout queue
php artisan queue:failed               # List failed jobs
php artisan queue:retry all            # Retry all failed jobs

# Testing
php artisan test         # Run PHPUnit/Pest tests
```

---

## 📚 API Documentation

### Authentication Endpoints
```
POST   /register               # User registration
POST   /login                  # User login
POST   /logout                 # User logout
POST   /verify-otp             # Verify OTP code
POST   /resend-otp             # Resend OTP
GET    /auth/google            # Google OAuth redirect
GET    /auth/google/callback   # Google OAuth callback
GET    /auth/facebook          # Facebook OAuth redirect
GET    /auth/facebook/callback # Facebook OAuth callback
```

### Student Endpoints
```
GET    /student/dashboard                  # Student dashboard
GET    /student/bookings                   # List bookings
POST   /student/book/process               # Create booking
GET    /student/bookings/{id}              # Booking details
POST   /student/booking/{id}/cancel        # Cancel booking
GET    /student/teachers                   # Browse teachers
GET    /student/wallet                     # Wallet dashboard
POST   /student/payment/initialize         # Initialize payment
GET    /student/ratings                    # My reviews
```

### Teacher Endpoints
```
GET    /teacher/dashboard                  # Teacher dashboard
GET    /teacher/requests                   # Booking requests
POST   /teacher/schedule/availability      # Set availability
GET    /teacher/earnings                   # Earnings dashboard
POST   /teacher/payouts                    # Request payout
GET    /teacher/payouts                    # Payout history
POST   /teacher/payment/methods/*          # Payment methods
```

### Admin Endpoints
```
GET    /admin/dashboard                    # Admin dashboard
GET    /admin/teachers                     # Manage teachers
POST   /admin/teachers/{id}/approve        # Approve teacher
GET    /admin/bookings                     # All bookings
GET    /admin/payments                     # Payment management
POST   /admin/payouts/{id}/approve         # Approve payout
GET    /admin/settings                     # Platform settings
```

### Webhook Endpoints
```
POST   /webhooks/paystack                  # Paystack webhooks
POST   /webhooks/livekit                   # LiveKit webhooks
```

---

## 🧪 Testing

### Running Tests
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/BookingTest.php

# Run with coverage
php artisan test --coverage

# Run specific test method
php artisan test --filter test_user_can_create_booking
```

### Test Structure
```
tests/
├── Feature/              # Integration tests
│   ├── Auth/
│   ├── Booking/
│   ├── Payment/
│   └── Admin/
├── Unit/                 # Unit tests
│   ├── Services/
│   └── Models/
├── Pest.php             # Pest configuration
└── TestCase.php         # Base test case
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Generate new `APP_KEY` in production
- [ ] Configure production database
- [ ] Set up Redis for caching and sessions
- [ ] Configure mail server (SMTP/SES)
- [ ] Set up queue worker as systemd service
- [ ] Configure Reverb for WebSockets
- [ ] Set up SSL certificate
- [ ] Configure payment gateway API keys (live mode)
- [ ] Set up backup system
- [ ] Configure monitoring (Laravel Pulse, Sentry)
- [ ] Run optimization commands:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  npm run build
  ```

### Queue Worker (Systemd)

Create `/etc/systemd/system/iqraquest-worker.service`:

```ini
[Unit]
Description=IqraQuest Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/iqraquest/artisan queue:work --queue=payouts,default --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable iqraquest-worker
sudo systemctl start iqraquest-worker
```

---

## 🔒 Security

### Security Features Implemented
- **Authentication**: Fortify + Socialite with 2FA support
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Form Request validation on all inputs
- **SQL Injection**: Eloquent ORM prevents SQL injection
- **XSS Protection**: Blade/React escaping by default
- **CSRF Protection**: Laravel CSRF middleware
- **Password Hashing**: Bcrypt hashing (Laravel default)
- **Session Security**: Secure, HTTP-only cookies
- **Payment Security**: Webhook signature verification
- **Rate Limiting**: Throttle middleware on sensitive routes
- **IP Blocking**: Automatic blocking for suspicious activity

---

## 📖 Documentation

- **[Coding Rules](coding_rules.md)** - Comprehensive development guidelines
- **[Financial Architecture](FINANCIAL_BACKEND_ARCHITECTURE.md)** - Payment system details
- **[Payment Gateways](PAYMENT_GATEWAYS.md)** - Gateway integration guide
- **[Classroom Plan](classroom_plan.md)** - Live classroom implementation

### Resources

- **Iconify Icons**: https://icon-sets.iconify.design/
- **Tailwind CSS**: https://tailwindcss.com/
- **Inertia.js**: https://inertiajs.com/
- **React**: https://react.dev/
- **Laravel**: https://laravel.com/docs
- **LiveKit**: https://docs.livekit.io/
- **Paystack**: https://paystack.com/docs

---

## 🤝 Contributing

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the coding standards
   - Add tests for new features
   - Update documentation
4. **Run quality checks**
   ```bash
   npm run lint
   npm run format
   npm run types
   php artisan test
   ```
5. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Commit Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

---

## 📋 Development Log

### Recent Updates

#### 2026-03-26 - Timezone Standardization & "In Review" Lifecycle 🆕
- ✅ **Platform-Wide Timezone Support**
  - Standardized all UI displays to use `Africa/Lagos` (WAT) as secondary local fallback.
  - Decoupled UTC database storage from user-facing local time calculations.
  - Updated all dashboard notifications (Student/Teacher/Admin) to use fixed WAT offsets for consistency.

- ✅ **"In Review" Booking Management**
  - New "In Review" tab implemented for both Student and Teacher dashboards.
  - Groups `awaiting_judgment` and `disputed` bookings for easier tracking during the 2-hour post-session window.
  - Enabled "Release Funds" and "Raise Dispute" actions for students during this period.

- ✅ **Admin Dashboard Refinements**
  - Fixed broken avatar images by using the standardized `avatar_url` accessor.
  - Refined bookings table to show teacher emails and full session durations (Start - End time).
  - Aligned Admin terminology to "In Review" to match student/teacher views.

#### 2025-12-31 - AI Teacher Matching & System Settings 🆕
- ✅ **AI-Powered Teacher Matching**
  - Gemini integration for intelligent teacher recommendations
  - Match requests stored and tracked
  - Preference-based filtering with scoring

- ✅ **System Settings Management**
  - Centralized admin settings configuration
  - Feature toggles and controls
  - Role and permission management

#### 2025-12-21 - Enhanced Onboarding & Verification Flow 🆕
- ✅ **Multi-Step Guardian Onboarding**
  - Redesigned 2-step onboarding flow for superior UX
  - **Step 1: Guardian Profile**: Unified collection of location, contact info, and family bio
  - **Step 2: Child Account Control**: Register multiple children with independent credentials

- ✅ **OTP Verification System Fixes**
  - Centralized redirection logic in middleware
  - Fixed "login later" redirection issues
  - Overrode `sendEmailVerificationNotification` for centralized OTP handling

- ✅ **Family-Oriented Notifications**
  - `WelcomeGuardianNotification` (Mail, Database, Broadcast)
  - Automated `WelcomeStudentNotification` for children

#### 2025-12-20 - Advanced Profile, Settings & Ratings Systems
- ✅ **Comprehensive Rating & Feedback System**
  - High-fidelity dashboard for Students, Guardians, and Teachers
  - Guardian integration with aggregated performance stats
  - Teacher dashboard with attendance calculation and positive feedback rates

- ✅ **Enhanced User Settings (Multi-Role)**
  - Two-Factor Authentication (2FA) with QR code setup and recovery codes
  - Granular notification settings (Email/Push) for 10+ activity types
  - Account Management: Identity verification resend, deactivation, deletion flows

- ✅ **Rich User Profiles**
  - Role-specific profile pages with specialized data
  - Modern, responsive edit modals with real-time state management

#### 2025-12-09 - Payment & Financial System
- ✅ Complete teacher earnings & payout system
- ✅ Instant auto-payout implementation
- ✅ Admin payment management panel
- ✅ Dynamic commission system
- ✅ Student wallet system
- ✅ Payment gateway integration (Paystack, PayPal)

#### 2025-12-03 - Authentication & Social Login
- ✅ Social login with Laravel Socialite (Google, Facebook)
- ✅ OTP email verification system
- ✅ Enhanced authentication security
- ✅ Multi-role registration system

#### 2025-11-27 - Initial Setup & Design System
- ✅ Responsive Navbar component with Figma design
- ✅ Automated scaling system using `clamp()` formulas
- ✅ Iconify integration (150,000+ icons)
- ✅ Comprehensive coding rules documentation

### Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Arabic, Urdu, French)
- [ ] Gamification system with achievement badges
- [ ] AI tutor assistant
- [ ] Automated grading system
- [ ] Marketplace for learning materials

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Laravel community
- React community
- LiveKit team
- Paystack team
- All open-source contributors

---

<div align="center">

**Built with ❤️ for Islamic Education**

[Website](https://iqraquest.com) • [Documentation](https://docs.iqraquest.com) • [Support](mailto:support@iqraquest.com)

</div>
