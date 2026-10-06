# Shared by the deploy scripts. Source it; do not run it.
set -eu

DEPLOY_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ENV_FILE=${ENV_FILE:-$DEPLOY_DIR/.env.production}
STATE_DIR=$DEPLOY_DIR/.state
DOCKER=${DOCKER:-docker}

[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE (copy .env.production.example)" >&2; exit 2; }
mkdir -p "$STATE_DIR"

# compose <tag> <args...>
compose() {
  tag=$1; shift
  APP_TAG=$tag "$DOCKER" compose -f "$DEPLOY_DIR/compose.yaml" --env-file "$ENV_FILE" "$@"
}

env_value() { sed -n "s/^$1=//p" "$ENV_FILE" | tail -n 1; }

# Waits until the app container reports healthy; fails after ~2 minutes.
wait_healthy() {
  i=0
  while [ $i -lt 40 ]; do
    id=$(compose "$1" ps -q app 2>/dev/null || true)
    if [ -n "$id" ]; then
      status=$("$DOCKER" inspect -f '{{.State.Health.Status}}' "$id" 2>/dev/null | tr -d '\r' || true)
      [ "$status" = healthy ] && return 0
    fi
    i=$((i + 1)); sleep 3
  done
  return 1
}
