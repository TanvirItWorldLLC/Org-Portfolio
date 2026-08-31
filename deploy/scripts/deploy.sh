#!/usr/bin/env bash
# Deploy / update Org Portfolio on the server.
# Run as the `portfolio` user.
set -euo pipefail

APP_DIR="/home/portfolio/app"
PM2_APP="org-portfolio"

cd "$APP_DIR"

echo "[$(date)] Pulling latest..."
git pull --rebase --autostash

echo "[$(date)] Installing deps..."
npm ci

echo "[$(date)] Building..."
npm run build

echo "[$(date)] Running Prisma migrations..."
npm run db:deploy

echo "[$(date)] Reloading PM2..."
pm2 reload "$PM2_APP" || pm2 start npm --name "$PM2_APP" -- start

pm2 save

echo "[$(date)] Deploy complete."
echo "[$(date)] Health check:"
curl -fsS "http://127.0.0.1:3000/api/health" || echo "WARN: local health check failed"

# Optionally, run external verify (needs DOMAIN env)
if [ -n "${DOMAIN:-}" ]; then
  bash /home/portfolio/app/deploy/scripts/verify.sh "$DOMAIN"
fi