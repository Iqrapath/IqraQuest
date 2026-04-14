#!/usr/bin/env bash

set -euo pipefail

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "Starting deployment..."

# 0) Safety check: do not deploy from dirty working tree.
if [[ -n "$(git status --porcelain)" ]]; then
  log "Deployment aborted: working tree has local changes."
  log "Commit or stash changes, then rerun deploy."
  exit 1
fi

# 1) Pull latest code
log "Pulling latest code from origin/main..."
git pull --rebase origin main

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
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6) Restart background processes
log "Restarting queue/reverb workers..."
php artisan queue:restart
php artisan reverb:restart

# 7) Reload PHP-FPM to clear OPcache (best-effort service detection)
log "Reloading PHP-FPM..."
if systemctl list-units --type=service --all | rg -q "php8\\.3-fpm\\.service"; then
  systemctl reload php8.3-fpm
elif systemctl list-units --type=service --all | rg -q "php-fpm\\.service"; then
  systemctl reload php-fpm
else
  log "Warning: PHP-FPM service not detected; skipping reload."
fi

log "Deployment complete."
