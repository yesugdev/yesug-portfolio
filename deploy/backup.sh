#!/bin/sh
# Portfolio MongoDB-ийн нөөц хуулбар. Хуучныг KEEP_DAYS хоногийн дараа устгана.
# cron (өдөр бүр 03:00):  0 3 * * * /root/portfolio/deploy/backup.sh >> /root/backups/portfolio/backup.log 2>&1
set -eu
DIR=${BACKUP_DIR:-/root/backups/portfolio}
KEEP_DAYS=${KEEP_DAYS:-14}
cd "$(dirname "$0")/.."
mkdir -p "$DIR"

FILE="$DIR/portfolio-$(date +%F-%H%M).archive"
docker compose exec -T mongo mongodump --quiet --gzip --archive --db portfolio > "$FILE.tmp"
[ -s "$FILE.tmp" ] || { rm -f "$FILE.tmp"; echo "$(date) АЛДАА: нөөц хоосон"; exit 1; }
mv "$FILE.tmp" "$FILE"

# Зөвхөн энэ хавтас дахь хуучин portfolio нөөцүүдийг устгана
find "$DIR" -maxdepth 1 -name 'portfolio-*.archive' -mtime +"$KEEP_DAYS" -delete
echo "$(date) OK $FILE ($(du -h "$FILE" | cut -f1))"
