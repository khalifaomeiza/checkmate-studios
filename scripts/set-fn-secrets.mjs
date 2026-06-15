#!/usr/bin/env node
/**
 * Push Edge Function secrets from .env to the linked Supabase project.
 * Requires: SUPABASE_ACCESS_TOKEN in .env (or env), project linked in supabase/config.toml
 *
 * Usage: npm run fn:secrets
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

const loadEnv = () => {
  const vars = {};
  if (!existsSync(envPath)) return vars;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
};

const env = { ...process.env, ...loadEnv() };

const pick = (...keys) => {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return '';
};

const secrets = {
  STUDIOS_CHECKMATE_RESEND_API_KEY: pick('STUDIOS_CHECKMATE_RESEND_API_KEY'),
  EMAIL_USER: pick('EMAIL_USER'),
  ADMIN_EMAIL_USER: pick('ADMIN_EMAIL_USER'),
  ADMIN_INVITE_CODE: pick('ADMIN_INVITE_CODE'),
  R2_ACCESS_KEY_ID: pick('R2_ACCESS_KEY_ID', 'CLOUDFLARE_R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: pick('R2_SECRET_ACCESS_KEY', 'CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
  R2_BUCKET: pick('R2_BUCKET', 'R2_BUCKET_NAME', 'CLOUDFLARE_R2_BUCKET'),
  R2_PUBLIC_BASE_URL: pick('R2_PUBLIC_BASE_URL', 'CLOUDFLARE_R2_PUBLIC_BASE_URL'),
  CLOUDFLARE_S3_API: pick('R2_S3_ENDPOINT', 'CLOUDFLARE_S3_API', 'R2_ENDPOINT'),
  R2_ACCOUNT_ID: pick('R2_ACCOUNT_ID', 'CLOUDFLARE_ACCOUNT_ID'),
  R2_CASE_STUDY_PREFIX: pick('R2_CASE_STUDY_PREFIX') || 'case-studies'
};

const missing = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_BASE_URL'].filter(
  (key) => !secrets[key]
);

if (missing.length) {
  console.error(`Missing R2 values in .env: ${missing.join(', ')}`);
  console.error('Add Cloudflare R2 credentials, then re-run npm run fn:secrets');
  process.exit(1);
}

if (!env.SUPABASE_ACCESS_TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in .env — create one at https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const args = ['secrets', 'set'];
for (const [key, value] of Object.entries(secrets)) {
  if (value) args.push(`${key}=${value}`);
}

console.log('Setting Supabase Edge Function secrets (R2 + email)…');

const result = spawnSync('supabase', args, {
  cwd: root,
  env: { ...process.env, SUPABASE_ACCESS_TOKEN: env.SUPABASE_ACCESS_TOKEN },
  stdio: 'inherit'
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('Done. Run npm run fn:deploy to publish updated functions.');
