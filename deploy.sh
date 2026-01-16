#!/bin/bash

# 1. Pull the latest code
git pull origin main

# 2. Install dependencies (Backend & Frontend)
composer install --no-dev --optimize-autoloader
npm install

# 3. Build React Assets (The fix for your current issue!)
npm run build

# 4. Update Database
php artisan migrate --force

# 5. Clear All Caches
php artisan optimize:clear

# 6. Restart Background Processes
# This makes sure the Queues and Reverb use the NEW code
php artisan queue:restart
php artisan reverb:restart
# (Note: We do not need to restart 'schedule:run', Cron handles it)

# 7. Reload PHP to clear OPcache
sudo systemctl reload php8.3-fpm
# (Change 8.3 to your actual PHP version)

echo "🚀 Deployment Complete!"
