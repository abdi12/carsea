#!/bin/sh
# Restores a backup into the database, REPLACING what is there.
# Usage: deploy/restore.sh <backup-file> <age-private-key-file> --yes
#
# The private key is read on this machine only for the duration of the
# restore; do not leave it on the server afterwards.
. "$(dirname -- "$0")/lib.sh"

backup=${1:-}; key=${2:-}; confirm=${3:-}
if [ ! -f "$backup" ] || [ ! -f "$key" ] || [ "$confirm" != "--yes" ]; then
  echo "Usage: $0 <backup-file> <age-private-key-file> --yes" >&2
  echo "This replaces the current database contents." >&2
  exit 2
fi

tag=$(cat "$STATE_DIR/current" 2>/dev/null || echo none)
compose "$tag" --profile backup build -q backup
compose "$tag" up -d db

# Decrypt and load inside the backup image, which has age and psql.
# The dump drops and recreates each object, so no manual cleanup is needed.
"$DOCKER" run --rm -i \
  --network carsea-prod_data \
  -e PGHOST=db \
  -e PGUSER="$(env_value POSTGRES_USER)" \
  -e PGPASSWORD="$(env_value POSTGRES_PASSWORD)" \
  -e PGDATABASE="$(env_value POSTGRES_DB)" \
  -v "$(cd "$(dirname "$backup")" && pwd):/in:ro" \
  -v "$(cd "$(dirname "$key")" && pwd):/key:ro" \
  --entrypoint sh carsea-prod-backup -c \
  "age --decrypt --identity /key/$(basename "$key") /in/$(basename "$backup") | gunzip | psql -v ON_ERROR_STOP=1 --quiet --single-transaction"

compose "$tag" exec -T db sh -c \
  'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v app_user="$APP_DB_USER"' \
  < "$DEPLOY_DIR/grant-app.sql"
echo "Restore complete."
