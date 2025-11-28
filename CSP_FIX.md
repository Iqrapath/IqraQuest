# Content Security Policy (CSP) Fix

## Issue
The security headers were blocking:
- Vite dev server (localhost)
- Google Fonts
- Font files from gstatic
- WebSocket connections for hot reload

## Solution

Updated `app/Http/Middleware/SecurityHeaders.php` to allow:

### Development Environment
```php
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.bunny.net http://localhost:* http://127.0.0.1:* http://[::1]:*"
```
- Allows Vite dev server on any port
- Allows localhost, 127.0.0.1, and IPv6 [::1]

### Fonts
```php
"style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com"
"font-src 'self' https://fonts.bunny.net https://fonts.gstatic.com data:"
```
- Allows both Bunny Fonts and Google Fonts
- Allows font files from gstatic CDN

### WebSocket (Hot Reload)
```php
"connect-src 'self' ws://localhost:* ws://127.0.0.1:* ws://[::1]:* http://localhost:* http://127.0.0.1:* http://[::1]:*"
```
- Allows WebSocket connections for Vite HMR
- Allows HTTP connections to dev server

### Images
```php
"img-src 'self' data: https: blob:"
```
- Allows all HTTPS images
- Allows data URIs and blob URLs

## Navigation Links Fixed

Changed from `<Link>` (Inertia) to `<a>` tags for hash navigation:

### Before (Broken)
```tsx
<Link href="#find-teacher">Find a Teacher</Link>
```
This tried to navigate to a new page.

### After (Working)
```tsx
<a href="#find-teacher">Find a Teacher</a>
```
This scrolls to the section on the same page.

## Updated Links

All navbar links now use anchor tags:
- Home → `<Link href="/">` (still uses Link for page navigation)
- Find a Teacher → `<a href="#find-teacher">`
- How It Works → `<a href="#how-it-works">`
- Features → `<a href="#features">`
- Contact → `<a href="#contact">`

## Production Considerations

For production, you should:

1. **Remove development URLs** from CSP:
```php
// Remove these in production:
http://localhost:*
http://127.0.0.1:*
http://[::1]:*
ws://localhost:*
```

2. **Tighten script-src**:
```php
// Production should not need 'unsafe-eval'
"script-src 'self' 'unsafe-inline' https://fonts.bunny.net"
```

3. **Use environment-based CSP**:
```php
$isDev = app()->environment('local', 'development');

$scriptSrc = $isDev 
    ? "'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:*"
    : "'self' 'unsafe-inline' https://fonts.bunny.net";
```

## Testing

1. Clear cache:
```bash
php artisan config:clear
php artisan cache:clear
```

2. Restart Vite:
```bash
npm run dev
```

3. Check browser console - no more CSP errors!

## Files Modified

1. `app/Http/Middleware/SecurityHeaders.php` - Updated CSP rules
2. `resources/js/components/landing/Navbar.tsx` - Changed Link to anchor tags

## Result

✅ Vite dev server works
✅ Fonts load properly
✅ Hot reload works
✅ Navigation scrolls smoothly
✅ No CSP errors in console
