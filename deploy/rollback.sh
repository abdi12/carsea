#!/bin/sh
# Puts the previously deployed app version back. Usage: deploy/rollback.sh [tag]
# The database is not touched; see docs/operations.md for restoring data.
. "$(dirname -- "$0")/lib.sh"

current=$(cat "$STATE_DIR/current" 2>/dev/null || true)
tag=${1:-$(cat "$STATE_DIR/previous" 2>/dev/null || true)}
[ -n "$tag" ] || { echo "No previous version recorded; pass a tag." >&2; exit 2; }

echo "Rolling back from ${current:-unknown} to $tag"
compose "$tag" up -d app proxy || true
if wait_healthy "$tag"; then
  echo "$tag" > "$STATE_DIR/current"
  [ -n "$current" ] && echo "$current" > "$STATE_DIR/previous"
  echo "Now running $tag."
else
  echo "$tag did not become healthy." >&2
  exit 1
fi
