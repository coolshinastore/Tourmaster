#!/bin/bash
# ── Daily PostgreSQL backup ───────────────────────────────────────────
# Add to cron: 0 2 * * * bash /opt/tourmaster/deploy/backup.sh

set -euo pipefail

APP_DIR="/opt/tourmaster"
BACKUP_DIR="/opt/tourmaster/backups"
KEEP_DAYS=14

source "$APP_DIR/.env"

mkdir -p "$BACKUP_DIR"

FILENAME="tourmaster-$(date +%Y%m%d_%H%M%S).sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

echo "==> Creating backup: $FILENAME"

docker exec tourmaster-db \
  pg_dump -U "${DB_USERNAME:-tourmaster_user}" tourmaster \
  | gzip > "$FILEPATH"

echo "==> Backup saved: $FILEPATH ($(du -sh "$FILEPATH" | cut -f1))"

# Remove old backups
find "$BACKUP_DIR" -name "tourmaster-*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "==> Old backups cleaned (kept last $KEEP_DAYS days)"

ls -lh "$BACKUP_DIR"
