#!/bin/sh
# Writes one compressed dump, encrypted to BACKUP_RECIPIENT (an age public
# key), into /backups. Only the matching private key, which must be kept
# off this server, can read it. Old dumps are pruned after BACKUP_KEEP_DAYS.
set -eu

stamp=$(date -u +%Y%m%dT%H%M%SZ)
target="/backups/carsea-$stamp.sql.gz.age"
partial="$target.partial"
trap 'rm -f "$partial"' EXIT

# pipefail is not POSIX; check pg_dump's status through a marker instead.
{ pg_dump --no-owner --no-privileges --clean --if-exists || touch /tmp/dump-failed; } \
  | gzip -9 \
  | age --recipient "$BACKUP_RECIPIENT" --output "$partial"

if [ -e /tmp/dump-failed ]; then
  echo "backup FAILED: pg_dump reported an error" >&2
  exit 1
fi
# An encrypted empty dump is about 200 bytes; a real one is far larger.
if [ "$(wc -c < "$partial")" -lt 1000 ]; then
  echo "backup FAILED: dump is implausibly small" >&2
  exit 1
fi

mv "$partial" "$target"
# Monitoring reads this file to confirm a recent backup exists.
date -u +%Y-%m-%dT%H:%M:%SZ > /backups/LAST_SUCCESS
find /backups -name 'carsea-*.sql.gz.age' -mtime "+$BACKUP_KEEP_DAYS" -delete
echo "backup written: $target ($(wc -c < "$target") bytes)"
