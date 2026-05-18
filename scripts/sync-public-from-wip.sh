#!/usr/bin/env bash
# Optional: copy assets from a local staging folder into canonical public paths.
# The live site uses only public/partners, public/resources, public/showcase, etc.
# Run this after you drop updated files into public/workInProgress/, then you can
# delete workInProgress whenever you like.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WIP="$ROOT/public/workInProgress"
if [[ ! -d "$WIP" ]]; then
  echo "No $WIP — nothing to sync."
  exit 0
fi
if [[ -d "$WIP/Resources" ]]; then
  mkdir -p "$ROOT/public/resources"
  rsync -a --delete "$WIP/Resources/" "$ROOT/public/resources/"
  echo "Synced Resources → public/resources/"
fi
if [[ -d "$WIP/Partners" ]]; then
  mkdir -p "$ROOT/public/partners"
  for i in 1 2 3 4; do
    src="$WIP/Partners/partners ${i}.png"
    if [[ -f "$src" ]]; then
      cp "$src" "$ROOT/public/partners/partner-${i}.png"
    fi
  done
  echo "Synced Partners → public/partners/partner-{1..4}.png"
fi
echo "Done."
