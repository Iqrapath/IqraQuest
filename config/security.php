<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains security-related configuration for the application.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Password Requirements
    |--------------------------------------------------------------------------
    |
    | Configure password strength requirements for user accounts.
    |
    */
    'password' => [
        'min_length' => env('PASSWORD_MIN_LENGTH', 12),
        'require_uppercase' => env('PASSWORD_REQUIRE_UPPERCASE', true),
        'require_lowercase' => env('PASSWORD_REQUIRE_LOWERCASE', true),
        'require_numbers' => env('PASSWORD_REQUIRE_NUMBERS', true),
        'require_symbols' => env('PASSWORD_REQUIRE_SYMBOLS', true),
        'compromised_threshold' => env('PASSWORD_COMPROMISED_THRESHOLD', 0),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for various endpoints.
    |
    */
    'rate_limiting' => [
        'login_attempts' => env('RATE_LIMIT_LOGIN', 5),
        'login_decay_minutes' => env('RATE_LIMIT_LOGIN_DECAY', 1),
        'api_requests' => env('RATE_LIMIT_API', 60),
        'api_decay_minutes' => env('RATE_LIMIT_API_DECAY', 1),
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Security
    |--------------------------------------------------------------------------
    |
    | Configure session security settings.
    |
    */
    'session' => [
        'regenerate_on_login' => true,
        'invalidate_on_logout' => true,
        'timeout_minutes' => env('SESSION_TIMEOUT', 120),
    ],

    /*
    |--------------------------------------------------------------------------
    | IP Blocking
    |--------------------------------------------------------------------------
    |
    | Configure IP blocking for suspicious activity.
    |
    */
    'ip_blocking' => [
        'enabled' => env('IP_BLOCKING_ENABLED', true),
        'max_attempts' => env('IP_BLOCKING_MAX_ATTEMPTS', 10),
        'block_duration_minutes' => env('IP_BLOCKING_DURATION', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Security
    |--------------------------------------------------------------------------
    |
    | Configure file upload security settings.
    |
    */
    'file_upload' => [
        'max_size' => env('FILE_UPLOAD_MAX_SIZE', 10240), // KB
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        'scan_for_malware' => env('FILE_UPLOAD_SCAN_MALWARE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Headers
    |--------------------------------------------------------------------------
    |
    | Configure security headers.
    |
    */
    'headers' => [
        'hsts_enabled' => env('SECURITY_HSTS_ENABLED', true),
        'hsts_max_age' => env('SECURITY_HSTS_MAX_AGE', 31536000),
        'csp_enabled' => env('SECURITY_CSP_ENABLED', true),
    ],

];
