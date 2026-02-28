Below is a **clear technical context document** you can give another AI agent (or developer) so they understand exactly what must be changed and why.

You can paste this directly.

---

# PROJECT CONTEXT: Timezone Architecture Correction

## Project Stack

* Laravel 11+
* PHP 8.4+
* Booking + Escrow-based platform
* System settings stored in `system_settings` table
* Admin panel allows changing:

  * Language
  * Timezone

---

# Current Problem

The application currently overrides the system timezone dynamically inside `AppServiceProvider`.

### Current Implementation

Inside `AppServiceProvider::boot()`:

```php
$timezone = \App\Models\SystemSetting::get('timezone');
if ($timezone) {
    config(['app.timezone' => $timezone]);
    date_default_timezone_set($timezone);
}
```

### Result

This mutates the core Laravel timezone at runtime.

Effects:

* Carbon instances shift timezone
* Model timestamps use mutated timezone
* Queued jobs operate in mutated timezone
* Scheduler timing changes
* Booking windows shift
* Escrow release logic shifts
* Dispute windows shift

This creates systemic risk in a financial + booking system.

---

# Required Architecture Correction

## 1️⃣ Lock System Timezone to UTC (Permanent)

* `config/app.php` must remain:

```php
'timezone' => 'UTC',
```

* Remove all runtime mutations of:

  * `config(['app.timezone' => ...])`
  * `date_default_timezone_set(...)`

System timezone must never be dynamic.

---

## 2️⃣ Treat Admin Timezone as Display Preference Only

Admin timezone should:

* Be stored in `system_settings.timezone`
* NOT affect backend logic
* ONLY affect formatted output

---

# Target Architecture Model

| Layer              | Timezone            |
| ------------------ | ------------------- |
| Database           | UTC                 |
| Business Logic     | UTC                 |
| Scheduler          | UTC                 |
| Queue Workers      | UTC                 |
| Storage timestamps | UTC                 |
| Display layer      | User/Admin timezone |

---

# Required Refactor Steps

### Step 1: Remove Timezone Mutation

Delete this from `AppServiceProvider`:

```php
config(['app.timezone' => $timezone]);
date_default_timezone_set($timezone);
```

---

### Step 2: Create Timezone Helper

Create a helper or service:

```php
function display_timezone(): string
{
    return \App\Models\SystemSetting::get('timezone') ?? 'UTC';
}
```

---

### Step 3: Convert Only During Display

Example:

```php
$booking->start_time->copy()->setTimezone(display_timezone());
```

Or per-user:

```php
$booking->start_time->copy()->setTimezone($user->timezone ?? 'UTC');
```

---

# Critical Rule

Never mutate:

```php
config('app.timezone')
date_default_timezone_set()
```

After application boot.

---

# Why This Is Mandatory

This platform includes:

* Scheduled class sessions
* Join windows
* Escrow release logic
* Dispute deadlines
* Recurring bookings
* Payment timing enforcement

Changing the system timezone post-deployment would:

* Retroactively alter booking logic
* Break financial guarantees
* Create legal exposure
* Cause irreversible timestamp inconsistencies

UTC must remain the single source of truth.

---

# Validation Checklist After Refactor

After removal:

Run:

```bash
php artisan config:clear
php artisan cache:clear
```

Then in Tinker:

```php
now()->timezoneName
```

Expected:

```
UTC
```

If not UTC → the mutation still exists somewhere.

Search for:

```
config(['app.timezone'
date_default_timezone_set(
```

---

# End State

* Backend logic is deterministic
* Financial timing is stable
* Global scaling is safe
* Display remains flexible

---

If you want, you can also generate a **clean production-grade TimezoneService class** instead of using a helper function.
