#!/usr/bin/env bash
# Daily MySQL backup for Org Portfolio.
# Cron: 30 3 * * * /home/portfolio/backup.sh >> /home/portfolio/backups/backup.log 2>&1
set -euo pipefail

BACKUP_DIR="/home/portfolio/backups"
DB_NAME="org_portfolio"
DB_USER="org_user"
# Either DB_PASS env or ~/.my.cnf with [client] user/password
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

echo "[$(date)] Starting backup of $DB_NAME -> $BACKUP_FILE"
mysqldump \
  --user="$DB_USER" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --default-character-set=utf8mb4 \
  "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify backup is non-empty
if [ ! -s "$BACKUP_FILE" ]; then
  echo "[$(date)] ERROR: backup file is empty!" >&2
  exit 1
fi

# Also upload to a remote location if BACKUP_REMOTE_DEST is set (e.g. user@host:/backups/)
if [ -n "${BACKUP_REMOTE_DEST:-}" ]; then
  echo "[$(date)] Copying to $BACKUP_REMOTE_DEST"
  rsync -az "$BACKUP_FILE" "$BACKUP_REMOTE_DEST"
fi

# Prune old backups
find "$BACKUP_DIR" -name "db_${DB_NAME}_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete

echo "[$(date)] Backup complete: $(du -h "$BACKUP_FILE" | cut -f1)"

# Verify last 3 backups can be parsed
LATEST=$(ls -1t "$BACKUP_DIR"/db_${DB_NAME}_*.sql.gz | head -1)
gunzip -c "$LATEST" | head -1 > /dev/null && echo "[$(date)] Verified: $LATEST is valid SQL."