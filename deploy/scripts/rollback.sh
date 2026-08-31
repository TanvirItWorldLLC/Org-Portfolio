#!/usr/bin/env bash
# Rollback Org Portfolio to the previous git commit and restore DB from latest backup.
# Usage: ./rollback.sh [commit_sha]
#   If commit_sha is omitted, rolls back one commit.
set -euo pipefail

APP_DIR="/home/portfolio/app"
PM2_APP="org-portfolio"
BACKUP_DIR="/home/portfolio/backups"

cd "$APP_DIR"

# Determine target commit
if [ "${1:-}" ]; then
  TARGET="$1"
else
  TARGET="HEAD~1"
fi

echo "[$(date)] Rolling back to $TARGET"
git checkout "$TARGET"

echo "[$(date)] Reinstalling & rebuilding..."
npm ci
npm run build

echo "[$(date)] Restarting PM2..."
pm2 reload "$PM2_APP" || pm2 restart "$PM2_APP"
pm2 save

# Optional: restore DB
if [ "${RESTORE_DB:-0}" = "1" ]; then
  echo "[$(date)] RESTORE_DB=1 — restoring latest DB backup..."
  LATEST=$(ls -1t "$BACKUP_DIR"/db_*.sql.gz | head -1)
  if [ -z "$LATEST" ]; then
    echo "ERROR: no backup found in $BACKUP_DIR" >&2
    exit 1
  fi
  echo "[$(date)] Using $LATEST"
  gunzip -c "$LATEST" | mysql -u org_user -p org_portfolio
  echo "[$(date)] DB restored."
fi

echo "[$(date)] Rollback complete. Verify:"
curl -fsS "http://127.0.0.1:3000/api/health" || echo "WARN: local health check failed"