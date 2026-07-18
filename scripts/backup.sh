#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Εβδομαδιαίο backup: βάση (db.sqlite3) + media (εικόνες/logos).
# Κρατάει τα 8 πιο πρόσφατα αρχεία στο ~/backups.
# Cron (cPanel → Cron Jobs, κάθε Δευτέρα 04:00):
#   0 4 * * 1 /bin/bash $HOME/fkechagias.gr/scripts/backup.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

APP="$HOME/fkechagias.gr"
DEST="$HOME/backups"
STAMP=$(date +%Y%m%d-%H%M)

mkdir -p "$DEST"
tar -czf "$DEST/fkechagias-$STAMP.tar.gz" -C "$APP" db.sqlite3 media

# Κράτα μόνο τα 8 τελευταία
ls -1t "$DEST"/fkechagias-*.tar.gz 2>/dev/null | tail -n +9 | xargs -r rm --

echo "OK: $DEST/fkechagias-$STAMP.tar.gz"
