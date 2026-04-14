#!/usr/bin/env bash

set -euo pipefail

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "Starting deployment..."

# 0) Sync working tree to exact origin/main state (deterministic deploy)
log "Syncing repository with origin/main..."
git fetch origin
git reset --hard origin/main
git clean -fd

# 2) Install dependencies (Backend & Frontend)
log "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

log "Installing Node dependencies..."
npm ci

# 3) Build assets
log "Building frontend assets..."
npm run build

# 4) Update database
log "Running migrations..."
php artisan migrate --force

# 5) Clear/refresh caches
log "Optimizing Laravel caches..."
php artisan optimize:clear
php artisan optimize

# 6) Restart background processes
log "Restarting queue/reverb workers..."
php artisan queue:restart
php artisan reverb:restart

# 7) Reload PHP-FPM to clear OPcache
log "Reloading PHP-FPM..."
if systemctl list-units --type=service --all | grep -q "php-fpm"; then
  systemctl reload php-fpm || systemctl restart php-fpm
else
  log "Warning: PHP-FPM service not detected; skipping reload."
fi

log "Deployment complete."
