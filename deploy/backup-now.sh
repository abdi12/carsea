#!/bin/sh
# Takes one encrypted backup, then runs BACKUP_SYNC_CMD if it is set.
# Schedule from cron, e.g. daily at 02:30 server time:
#   30 2 * * * /srv/carsea/deploy/backup-now.sh >> /var/log/carsea-backup.log 2>&1
. "$(dirname -- "$0")/lib.sh"

tag=$(cat "$STATE_DIR/current" 2>/dev/null || echo none)
compose "$tag" --profile backup build -q backup
compose "$tag" --profile backup run --rm backup

sync_cmd=$(env_value BACKUP_SYNC_CMD)
if [ -n "$sync_cmd" ]; then
  sh -c "$sync_cmd" || { echo "backup FAILED: off-server copy did not complete" >&2; exit 1; }
else
  echo "WARNING: BACKUP_SYNC_CMD is not set; this backup exists only on this server." >&2
fi
