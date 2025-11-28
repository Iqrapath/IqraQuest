# Security Automation Guide

## Console Commands vs Scheduled Tasks

### Console Commands (Manual Execution)
Commands in `app/Console/Commands/` are **automatically discovered** by Laravel. No registration needed!

You can run them manually anytime:
```bash
php artisan security:report
php artisan security:unblock-ip 192.168.1.1
```

### Scheduled Tasks (Automatic Execution)
To run commands **automatically** on a schedule, register them in `routes/console.php`.

## 📅 Scheduled Security Tasks

Your application now has these automated security tasks:

### 1. Daily Security Report (9:00 AM)
```php
Schedule::command('security:report --days=1')
    ->dailyAt('09:00')
    ->appendOutputTo(storage_path('logs/security-reports.log'));
```
- Generates daily security report
- Saves to `storage/logs/security-reports.log`
- Shows login stats, security events, suspicious IPs

### 2. Weekly Cleanup - Old Login Attempts
```php
Schedule::call(function () {
    \DB::table('login_attempts')
        ->where('attempted_at', '<', now()->subDays(30))
        ->delete();
})->weekly();
```
- Runs every Sunday at midnight
- Deletes login attempts older than 30 days
- Keeps database clean

### 3. Monthly Cleanup - Old Security Logs
```php
Schedule::call(function () {
    \DB::table('security_logs')
        ->where('created_at', '<', now()->subDays(90))
        ->delete();
})->monthly();
```
- Runs on 1st of each month
- Deletes security logs older than 90 days
- Maintains performance

## 🚀 Activating the Scheduler

### Development (Local)
Run the scheduler manually:
```bash
php artisan schedule:work
```
This runs continuously and executes scheduled tasks.

### Production (Server)
Add this to your server's crontab:
```bash
* * * * * cd /path/to/iqraquest && php artisan schedule:run >> /dev/null 2>&1
```

**How to add to crontab:**
```bash
# Open crontab editor
crontab -e

# Add the line above (replace /path/to/iqraquest with your actual path)
# Save and exit
```

This single cron entry runs every minute and Laravel handles the rest!

## 📋 View Scheduled Tasks

See all scheduled tasks:
```bash
php artisan schedul
``

Output:
```
0 9 * * *  php artisan security:report --days=1 ........ Next Due: 13 hours from now
0 0 * * 0  Closure (cleanup login attempts) ............ Next Due: 1 day from now
0 0 1 * *  Closure (cleanup security logs) ............. Next Due: 2 days from now
```

## 🧪 Test Scheduled Tasks

Run all scheduled tasks immediately (for testing):
```bash
php artisan schedule:run
```

Run a specific command:
```bash
php artisan security:report --days=7
```

## 📊 View Security Report Logs

Check the automated daily reports:
```bash
# Windows
type storage\logs\security-reports.log

# Linux/Mac
cat storage/logs/security-reports.log
```

## 🔧 Customizing Schedules

### Change Report Time
```php
// Run at 6 AM instead of 9 AM
Schedule::command('security:report --days=1')
    ->dailyAt('06:00');
```

### Change Cleanup Frequency
```php
// Clean up every 2 weeks instead of weekly
Schedule::call(function () {
    // cleanup code
})->everyTwoWeeks();
```

### Available Schedule Frequencies
```php
->everyMinute()           // Every minute
->everyFiveMinutes()      // Every 5 minutes
->hourly()                // Every hour
->daily()                 // Daily at midnight
->dailyAt('13:00')        // Daily at 1 PM
->weekly()                // Weekly on Sunday
->monthly()               // Monthly on 1st
->quarterly()             // Every 3 months
->yearly()                // Yearly on Jan 1
```

## 📧 Email Security Reports

Want to receive reports via email? Add this:

```php
Schedule::command('security:report --days=1')
    ->dailyAt('09:00')
    ->emailOutputTo('admin@iqraquest.com');
```

Make sure your mail configuration is set up in `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@iqraquest.com
MAIL_FROM_NAME="IqraQuest Security"
```

## 🔔 Slack Notifications

Send critical security alerts to Slack:

```php
use Illuminate\Support\Facades\Http;

Schedule::call(function () {
    $criticalEvents = \DB::table('security_logs')
        ->where('severity', 'critical')
        ->where('created_at', '>=', now()->subDay())
        ->count();
    
    if ($criticalEvents > 0) {
        Http::post('YOUR_SLACK_WEBHOOK_URL', [
            'text' => "⚠️ {$criticalEvents} critical security events in the last 24 hours!"
        ]);
    }
})->hourly();
```

## 🎯 Best Practices

1. **Monitor Logs**: Check `storage/logs/security-reports.log` regularly
2. **Adjust Retention**: Keep logs longer if needed for compliance
3. **Test Schedules**: Run `php artisan schedule:run` before deploying
4. **Set Up Alerts**: Configure email/Slack for critical events
5. **Backup Before Cleanup**: Ensure backups include security logs

## 🐛 Troubleshooting

### Scheduler Not Running
```bash
# Check if cron is running
service cron status

# Check crontab
crontab -l

# Check Laravel logs
tail -f storage/logs/laravel.log
```

### Tasks Not Executing
```bash
# Test manually
php artisan schedule:run

# Check task list
php artisan schedule:list

# Enable debug mode
php artisan schedule:work --verbose
```

### Permission Issues
```bash
# Fix storage permissions
chmod -R 775 storage
chown -R www-data:www-data storage
```

## 📝 Summary

- **Commands**: Auto-discovered, run manually
- **Schedules**: Defined in `routes/console.php`, run automatically
- **Activation**: Add one cron entry on production server
- **Monitoring**: Check logs and run `schedule:list`

Your security system now runs on autopilot! 🚀
