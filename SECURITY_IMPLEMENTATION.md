# Security Implementation Guide

## Overview
This document outlines the comprehensive security measures implemented in IqraQuest to prevent intrusions and protect user data.

## 🔒 Security Features Implemented

### 1. Enhanced Password Security
- **Minimum Length**: 12 characters (configurable)
- **Complexity Requirements**:
  - Mixed case letters (uppercase + lowercase)
  - Numbers required
  - Special symbols required
  - Checks against compromised password databases
- **Location**: `app/Actions/Fortify/PasswordValidationRules.php`

### 2. Security Middleware Stack

#### SecurityHeaders Middleware
Adds critical security headers to all responses:
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Enables XSS filtering
- `Content-Security-Pol`: Controls resource loading
- `Strict-Transport-Security`: Forces HTTPS in production
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features

#### PreventSqlInjection Middleware
- Scans all incoming requests for SQL injection patterns
- Blocks requests containing suspicious SQL keywords
- Patterns detected:
  - UNION SELECT attacks
  - INSERT/UPDATE/DELETE attempts
  - DROP TABLE commands
  - SQL comments and delimiters
  - Stored procedure calls

#### LogSuspiciousActivity Middleware
- Monitors and logs suspicious patterns:
  - Directory traversal attempts (`../`)
  - XSS attempts (`<script>` tags)
  - JavaScript protocol usage
  - Event handler injections
  - System command attempts
  - PHP function calls
  - Superglobal access attempts
- Logs suspicious user agents (sqlmap, nikto, nmap, etc.)

#### BlockSuspiciousIPs Middleware
- Automatically blocks IPs with suspicious activity
- Configurable thresholds and block duration
- Cache-based blocking for performance
- Default: 10 failed attempts = 60-minute block

### 3. Session Security Enhancements

**Updated Settings** (`config/session.php`):
- `expire_on_close`: `true` - Sessions expire when browser closes
- `encrypt`: `true` - All session data encrypted
- `same_site`: `strict` - Prevents CSRF attacks
- `secure`: `true` - Cookies only sent over HTTPS
- `http_only`: `true` - JavaScript cannot access cookies

### 4. Authentication Security

**Updated Settings** (`config/auth.php`):
- `password_timeout`: 900 seconds (15 minutes) - Reduced from 3 hours
- Password reset throttling: 60 seconds between attempts
- Password reset token expiry: 60 minutes

**Rate Limiting** (`app/Providers/FortifyServiceProvider.php`):
- Login attempts: 5 per minute per email/IP combination
- Two-factor authentication: 5 attempts per minute

### 5. Security Logging & Monitoring

#### SecurityLog Model
Tracks all security-related events:
- Event type (login, logout, password reset, etc.)
- IP address
- User ID (if authenticated)
- Detailed description
- Metadata (user agent, additional context)
- Severity level (info, warning, critical)

#### LoginAttempt Model
Tracks all login attempts:
- Email address
- IP address
- Success/failure status
- User agent
- Timestamp
- Methods to query recent failed attempts

#### Event Listeners
Automatically log security events:
- `LogSuccessfulLogin`: Logs successful authentications
- `LogFailedLogin`: Logs failed login attempts + detects brute force
- `LogLogout`: Logs user logouts
- `LogPasswordReset`: Logs password changes

### 6. Database Migrations
Two new tables for security tracking:
- `security_logs`: Comprehensive security event logging
- `login_attempts`: Detailed login attempt tracking

## 📋 Installation Steps

### Step 1: Run Database Migrations
```bash
php artisan migrate
```

### Step 2: Update Environment Variables
Copy settings from `.env.security` to your `.env` file:

```env
# Password Requirements
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true

# Session Security
SESSION_EXPIRE_ON_CLOSE=true
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=strict

# IP Blocking
IP_BLOCKING_ENABLED=true
IP_BLOCKING_MAX_ATTEMPTS=10
IP_BLOCKING_DURATION=60
```

### Step 3: Clear Configuration Cache
```bash
php artisan config:clear
php artisan cache:clear
```

### Step 4: Test Security Features
```bash
php artisan test
```

## 🛡️ Security Best Practices

### For Development
1. Keep `APP_DEBUG=true` only in local environment
2. Use `SESSION_SECURE_COOKIE=false` for local HTTP
3. Monitor `storage/logs/laravel.log` for security warnings

### For Production
1. **CRITICAL**: Set `APP_ENV=production`
2. **CRITICAL**: Set `APP_DEBUG=false`
3. **CRITICAL**: Set `SESSION_SECURE_COOKIE=true`
4. **CRITICAL**: Use HTTPS (SSL certificate)
5. Set strong `APP_KEY` (run `php artisan key:generate`)
6. Use environment-specific `.env` file
7. Restrict file permissions on `.env` file (chmod 600)
8. Enable firewall rules
9. Keep Laravel and dependencies updated
10. Regular security audits

## 🔍 Monitoring Security

### View Security Logs
```php
use App\Models\SecurityLog;

// Get recent critical events
$criticalEvents = SecurityLog::where('severity', 'critical')
    ->orderBy('created_at', 'desc')
    ->take(50)
    ->get();

// Get events for specific IP
$ipEvents = SecurityLog::where('ip_address', '192.168.1.1')
    ->orderBy('created_at', 'desc')
    ->get();
```

### View Login Attempts
```php
use App\Models\LoginAttempt;

// Get recent failed attempts
$failedAttempts = LoginAttempt::where('successful', false)
    ->where('attempted_at', '>=', now()->subHours(24))
    ->get();

// Check for brute force on specific email
$attempts = LoginAttempt::recentFailedAttempts('user@example.com', 15);
```

### Manually Block an IP
```php
use App\Http\Middleware\BlockSuspiciousIPs;

// Block IP for 60 minutes
BlockSuspiciousIPs::blockIP('192.168.1.1', 60);
```

## 🚨 Attack Prevention

### SQL Injection
- ✅ Middleware scans all inputs
- ✅ Laravel's query builder uses prepared statements
- ✅ Eloquent ORM prevents SQL injection by default

### XSS (Cross-Site Scripting)
- ✅ Blade templates auto-escape output
- ✅ React components escape by default
- ✅ CSP headers restrict script execution
- ✅ Middleware detects XSS patterns

### CSRF (Cross-Site Request Forgery)
- ✅ Laravel's CSRF protection enabled
- ✅ Strict SameSite cookie policy
- ✅ CSRF tokens on all forms

### Brute Force Attacks
- ✅ Rate limiting on login (5 attempts/minute)
- ✅ IP blocking after 10 failed attempts
- ✅ Login attempt logging and monitoring
- ✅ Account lockout detection

### Session Hijacking
- ✅ Session encryption enabled
- ✅ Secure cookies (HTTPS only)
- ✅ HttpOnly cookies (no JavaScript access)
- ✅ Session regeneration on login
- ✅ Short session timeout

### Clickjacking
- ✅ X-Frame-Options header
- ✅ CSP frame-ancestors directive

### Directory Traversal
- ✅ Middleware detects `../` patterns
- ✅ Laravel's file system abstraction

## 📊 Configuration Reference

### config/security.php
Central security configuration file with all security settings.

### Middleware Order (bootstrap/app.php)
```php
1. SecurityHeaders          // Add security headers
2. BlockSuspiciousIPs       // Block known bad actors
3. LogSuspiciousActivity    // Monitor suspicious patterns
4. PreventSqlInjection      // Block SQL injection attempts
5. HandleAppearance         // App-specific middleware
6. HandleInertiaRequests    // Inertia.js middleware
7. AddLinkHeadersForPreloadedAssets // Performance
```

## 🔄 Regular Maintenance

### Daily
- Monitor security logs for critical events
- Review failed login attempts

### Weekly
- Review blocked IPs
- Check for unusual patterns in security logs
- Update dependencies: `composer update`

### Monthly
- Security audit of custom code
- Review and update security policies
- Test backup and recovery procedures

### Quarterly
- Penetration testing
- Security training for team
- Review and update security documentation

## 📞 Incident Response

If you detect a security breach:

1. **Immediate Actions**:
   - Block the attacking IP
   - Review security logs
   - Check affected user accounts
   - Change application keys if needed

2. **Investigation**:
   - Analyze attack vectors
   - Identify compromised data
   - Document the incident

3. **Recovery**:
   - Patch vulnerabilities
   - Notify affected users
   - Update security measures
   - Restore from backups if needed

4. **Prevention**:
   - Implement additional safeguards
   - Update security policies
   - Train team on new threats

## 📚 Additional Resources

- [Laravel Security Documentation](https://laravel.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PHP Security Best Practices](https://www.php.net/manual/en/security.php)
- [Laravel Fortify Documentation](https://laravel.com/docs/fortify)

## ✅ Security Checklist

- [x] Strong password requirements
- [x] Password breach detection
- [x] Rate limiting on authentication
- [x] Session encryption
- [x] Secure cookie settings
- [x] CSRF protection
- [x] SQL injection prevention
- [x] XSS prevention
- [x] Security headers
- [x] IP blocking
- [x] Security event logging
- [x] Login attempt tracking
- [x] Brute force detection
- [x] Two-factor authentication support
- [ ] SSL certificate (production)
- [ ] Regular security audits
- [ ] Backup strategy
- [ ] Incident response plan
- [ ] Security training

## 🎯 Next Steps

1. Run migrations to create security tables
2. Update `.env` with security settings
3. Test login with new password requirements
4. Monitor security logs
5. Set up SSL certificate for production
6. Configure automated backups
7. Create incident response procedures
8. Schedule regular security audits

