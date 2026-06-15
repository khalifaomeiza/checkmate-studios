#!/usr/bin/env node
/**
 * Apply supabase/migrations via Supabase Management API (HTTPS).
 * No database password or direct Postgres connection required.
 *
 * Setup (one-time):
 *   1. Create a token: https://supabase.com/dashboard/account/tokens
 *   2. Add to .env: SUPABASE_ACCESS_TOKEN=sbp_...
 *   3. Run: npm run db:push:api
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECT_REF = 'vqsdynkbxvxdsshvrklo';
const API = 'https://api.supabase.com/v1';

const loadEnv = () => {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
};

const loadAccessToken = () => {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }

  const candidates = [
    join(homedir(), '.config/supabase/access-token'),
    join(homedir(), 'Library/Application Support/supabase/access-token'),
    join(homedir(), '.supabase/access-token')
  ];

  for (const path of candidates) {
    if (existsSync(path)) return readFileSync(path, 'utf8').trim();
  }

  throw new Error(
    'Missing SUPABASE_ACCESS_TOKEN.\n' +
      'Create one at https://supabase.com/dashboard/account/tokens\n' +
      'Then add SUPABASE_ACCESS_TOKEN=sbp_... to your .env file.'
  );
};

const api = async (token, method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg =
      json?.message ?? json?.error ?? json?.raw ?? text ?? res.statusText;
    throw new Error(`${method} ${path} failed (${res.status}): ${msg}`);
  }

  return json;
};

const listLocalMigrations = () => {
  const dir = join(ROOT, 'supabase/migrations');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((file) => {
      const version = file.replace(/\.sql$/, '');
      return {
        version,
        name: version,
        file,
        query: readFileSync(join(dir, file), 'utf8')
      };
    });
};

const listRemoteMigrations = async (token) => {
  try {
    const rows = await api(token, 'GET', `/projects/${PROJECT_REF}/database/migrations`);
    if (!Array.isArray(rows)) return new Set();
    return new Set(rows.map((r) => r.version ?? r.name).filter(Boolean));
  } catch {
    return new Set();
  }
};

const main = async () => {
  loadEnv();
  const token = loadAccessToken();
  const local = listLocalMigrations();
  const remote = await listRemoteMigrations(token);

  const pending = local.filter((m) => !remote.has(m.version));

  if (pending.length === 0) {
    console.log('All migrations already applied on remote.');
    return;
  }

  console.log(`Applying ${pending.length} migration(s) via Management API…`);

  for (const migration of pending) {
    process.stdout.write(`  → ${migration.file} … `);
    await api(token, 'POST', `/projects/${PROJECT_REF}/database/migrations`, {
      query: migration.query,
      name: migration.version
    });
    console.log('ok');
  }

  console.log('Done.');
};

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
