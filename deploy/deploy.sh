#!/bin/sh
# Builds and releases the current checkout. Usage: deploy/deploy.sh [tag]
#
#   1. build the app and tools images, tagged with the git commit
#   2. take a backup of the database as it is now
#   3. apply migrations and re-grant the app role
#   4. start the new app and wait for it to report healthy
#   5. if it does not, put the previous version back
#
# Migrations are forward-only and must stay compatible with the previous
# app version, so step 5 never has to undo a schema change.
. "$(dirname -- "$0")/lib.sh"

tag=${1:-$(git -C "$DEPLOY_DIR/.." rev-parse --short HEAD)}
previous=$(cat "$STATE_DIR/current" 2>/dev/null || true)
echo "Deploying $tag (currently: ${previous:-nothing})"

# SKIP_BUILD=1 redeploys images that already exist under this tag.
if [ "${SKIP_BUILD:-}" != 1 ]; then
  if [ -z "${1:-}" ] && [ -n "$(git -C "$DEPLOY_DIR/.." status --porcelain --untracked-files=no)" ]; then
    echo "WARNING: uncommitted changes will be built into an image tagged $tag." >&2
  fi
  compose "$tag" --profile tools build app tools
fi
compose "$tag" up -d db

if [ -n "$previous" ]; then
  "$DEPLOY_DIR/backup-now.sh" || { echo "Backup failed; not deploying." >&2; exit 1; }
fi

compose "$tag" --profile tools run --rm tools db:migrate
compose "$tag" exec -T db sh -c \
  'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v app_user="$APP_DB_USER"' \
  < "$DEPLOY_DIR/grant-app.sql"

# `up` itself fails when the app never turns healthy (the proxy waits on
# it), so its exit status is not the verdict; the health check below is.
compose "$tag" up -d app proxy || true
if wait_healthy "$tag"; then
  [ -n "$previous" ] && [ "$previous" != "$tag" ] && echo "$previous" > "$STATE_DIR/previous"
  echo "$tag" > "$STATE_DIR/current"
  echo "Deployed $tag."
else
  echo "New version did not become healthy." >&2
  compose "$tag" logs --tail 40 app >&2 || true
  if [ -n "$previous" ]; then
    echo "Rolling back to $previous." >&2
    compose "$previous" up -d app proxy || true
    wait_healthy "$previous" || echo "Rollback is not healthy either; investigate now." >&2
  fi
  exit 1
fi
