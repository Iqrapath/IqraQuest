#!/usr/bin/env bash
#
# Frontend build (npm run build) needs a lot of RAM. On small VPSes the kernel may OOM-kill
# the build (you see: "Killed" with no PHP stack trace). Fixes:
#   - Add swap (e.g. 2G): fallocate/chmod/swapon, or
#   - Build assets in CI and upload public/build, then deploy with:
#       export DEPLOY_SKIP_NPM_BUILD=1
#   - Optionally cap Node heap (may fail on huge bundles instead of silent OOM):
#       export DEPLOY_NODE_HEAP_MB=1536
#
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

# 0) Sync working tree to exact origin state (deterministic deploy)
# Override with: DEPLOY_BRANCH=staging bash deploy.sh
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
log "Syncing repository with origin/${DEPLOY_BRANCH}..."
git fetch origin
git reset --hard "origin/${DEPLOY_BRANCH}"
git clean -fd

# 2) Install dependencies (Backend & Frontend)
log "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

log "Generating Wayfinder TypeScript routes (required for Vite build)..."
php artisan wayfinder:generate --with-form --no-interaction

if [[ "${DEPLOY_SKIP_NPM_BUILD:-0}" == "1" ]]; then
  log "Skipping npm ci / vite build (DEPLOY_SKIP_NPM_BUILD=1). Ensure public/build matches this release (e.g. built in CI and rsync'd here)."
else
  log "Installing Node dependencies..."
  npm ci

  # Cap V8 heap so small servers fail with a clear JS OOM instead of the kernel SIGKILL ("Killed").
  # Tune DEPLOY_NODE_HEAP_MB for your VPS (1536–4096 typical); unset to use Node default.
  if [[ -n "${DEPLOY_NODE_HEAP_MB:-}" ]]; then
    export NODE_OPTIONS="--max-old-space-size=${DEPLOY_NODE_HEAP_MB}"
    log "Using NODE_OPTIONS=${NODE_OPTIONS} for vite build."
  fi

  log "Building frontend assets..."
  npm run build
fi

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
