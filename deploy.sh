#!/usr/bin/env bash

set -euo pipefail

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "Starting deployment..."

# Storage must be writable by the PHP-FPM / web server user. If deploy runs as root,
# set before deploy:  export DEPLOY_FIX_PERMISSIONS=1
# Optional override:     export DEPLOY_WEB_USER=nginx   # or apache, www-data, etc.
if [[ "${DEPLOY_FIX_PERMISSIONS:-0}" == "1" ]]; then
  WEB_USER="${DEPLOY_WEB_USER:-www-data}"
  log "Fixing ownership/permissions on storage and bootstrap/cache for ${WEB_USER}..."
  chown -R "${WEB_USER}:${WEB_USER}" storage bootstrap/cache
  chmod -R ug+rwx storage bootstrap/cache
  # Log file may have been created by a different user during a prior deploy
  rm -f storage/logs/laravel.log
  touch storage/logs/laravel.log
  chown "${WEB_USER}:${WEB_USER}" storage/logs/laravel.log
  chmod 664 storage/logs/laravel.log
fi

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

log "Generating Wayfinder TypeScript routes (required for Vite build)..."
php artisan wayfinder:generate --with-form --no-interaction

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

systemctl restart laravel-reverb
systemctl restart laravel-queue
systemctl reload nginx

log "Deployment complete."
