#!/usr/bin/env bash
# Push Supabase migrations to the linked remote project.
#
# IMPORTANT: --password on `supabase link` only stores a local credential.
# It must match the password shown in Supabase Dashboard → Settings → Database.
# If auth fails, click "Reset database password" there, copy the new value, then rerun.
#
# Passwords with $ @ : / etc. are URL-encoded for the direct connection below.

set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="vqsdynkbxvxdsshvrklo"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "SUPABASE_DB_PASSWORD is not set in .env"
  echo "Reset/copy from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
  read -rsp "Paste database password: " SUPABASE_DB_PASSWORD
  echo
fi

# Encode for postgresql:// URL (fixes $ and other special characters)
ENCODED_PW="$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$SUPABASE_DB_PASSWORD")"
DB_URL="postgresql://postgres:${ENCODED_PW}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo "Linking project (direct connection, not pooler)…"
supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" --skip-pooler --yes

echo "Pushing migrations…"
supabase db push --db-url "$DB_URL" --yes

echo "Done."
