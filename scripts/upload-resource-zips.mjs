/**
 * Uploads `public/resources/Files/*.zip` and writes `src/data/resourceZipUrls.generated.ts`.
 *
 * Routing:
 *   - Files ≤ RESOURCE_ZIP_MAX_CLOUDINARY_BYTES (default 9 MiB) → Cloudinary `raw` (if configured).
 *   - Larger files → Cloudflare R2 (S3 API) when configured, else Supabase Storage.
 *
 * R2 bucket: create in Dashboard or `wrangler r2 bucket create <name>`. This script uses the
 * S3-compatible API (not Wrangler). Enable public access on the bucket and set R2_PUBLIC_BASE_URL
 * to your `*.r2.dev` subdomain or custom domain (the URL people use in the browser — not the S3 API host).
 *
 * Env — Cloudinary (optional, small zips):
 *   CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
 *   CLOUDINARY_RESOURCE_FOLDER (default: checkmate-studios/resource-zips)
 *
 * Env — Cloudflare R2 (recommended for large zips):
 *   CLOUDFLARE_S3_API=https://<account-id>.r2.cloudflarestorage.com
 *     (or R2_S3_ENDPOINT; or omit and set R2_ACCOUNT_ID / CLOUDFLARE_ACCOUNT_ID)
 *   R2_ACCESS_KEY_ID / CLOUDFLARE_R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY / CLOUDFLARE_R2_SECRET_ACCESS_KEY
 *   R2_BUCKET / CLOUDFLARE_R2_BUCKET
 *   R2_PUBLIC_BASE_URL=https://pub-xxxx.r2.dev   (no trailing slash — public download origin)
 *   Optional: R2_OBJECT_PREFIX=resource-zips   (prepended to object keys)
 *
 * Env — Supabase (fallback when R2 not configured):
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_RESOURCE_BUCKET (default: resource-zips)
 *
 * Env files merged (later overrides earlier; shell always wins):
 *   .env, .env.local, supabase/.env, supabase/.env.local, supabase/.env.functions
 *
 * Optional:
 *   RESOURCE_ZIP_MAX_CLOUDINARY_BYTES=9437184
 *   RESOURCE_ZIPS_DRY_RUN=1  |  --dry-run
 *   RESOURCE_ZIPS_FORCE_SUPABASE=1   (large files → Supabase only, skip R2)
 *   RESOURCE_ZIPS_ONLY_MISSING=1  |  --only-missing   (skip zips already listed in the generated .ts)
 *   --force   (re-upload every zip; ignores --only-missing)
 *
 * Usage: npm run upload:resource-zips
 *        npm run upload:resource-zips -- --only-missing
 */

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const require = createRequire(import.meta.url);
const cloudinary = require('cloudinary').v2;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FILES_DIR = join(ROOT, 'public', 'resources', 'Files');
const OUT_FILE = join(ROOT, 'src', 'data', 'resourceZipUrls.generated.ts');

const DEFAULT_CLOUDINARY_FOLDER = 'checkmate-studios/resource-zips';
const DEFAULT_MAX_CLOUDINARY = 9 * 1024 * 1024;
const DEFAULT_BUCKET = 'resource-zips';

function readEnvPairs(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  let text = readFileSync(filePath, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) {
      const trimmed = val.trim();
      if (trimmed === '' && out[key] !== undefined && out[key] !== '') {
        continue;
      }
      out[key] = trimmed;
    }
  }
  return out;
}

/**
 * Apply merged .env: file values fill in where process.env is unset OR empty string.
 * (Many shells export KEY= by mistake; that must not block real values in .env.)
 */
function loadAllEnv() {
  const paths = [
    join(ROOT, '.env'),
    join(ROOT, '.env.local'),
    join(ROOT, 'supabase', '.env'),
    join(ROOT, 'supabase', '.env.local'),
    join(ROOT, 'supabase', '.env.functions')
  ];
  const merged = {};
  for (const p of paths) Object.assign(merged, readEnvPairs(p));
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === '') continue;
    const cur = process.env[k];
    if (cur === undefined || cur === '') process.env[k] = v;
  }
}

function parseCloudinaryUrl(url) {
  if (!url || !url.startsWith('cloudinary://')) return null;
  try {
    const u = url.replace(/^cloudinary:\/\//, 'https://');
    const parsed = new URL(u);
    const apiKey = parsed.username;
    const apiSecret = parsed.password;
    const cloudName = parsed.hostname;
    if (!apiKey || !apiSecret || !cloudName) return null;
    return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
  } catch {
    return null;
  }
}

function configureCloudinary() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (fromUrl) {
    cloudinary.config(fromUrl);
    return true;
  }
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name && api_key && api_secret) {
    cloudinary.config({ cloud_name, api_key, api_secret });
    return true;
  }
  return false;
}

function explainSupabaseMissing() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const parts = [];
  if (!url) {
    parts.push(
      '  • Set SUPABASE_URL or VITE_SUPABASE_URL (e.g. https://xxxx.supabase.co — no trailing slash).'
    );
  }
  if (!key) {
    parts.push('  • Set SUPABASE_SERVICE_ROLE_KEY (Dashboard → API → service_role secret).');
  }
  if (parts.length) console.error('\n' + parts.join('\n') + '\n');
}

function explainR2Missing() {
  console.error(`
 R2 (large files) — set all of:
  • CLOUDFLARE_S3_API or R2_S3_ENDPOINT — e.g. https://<account-id>.r2.cloudflarestorage.com
  • R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY — R2 → Manage R2 API Tokens (S3 credentials)
  • R2_BUCKET_NAME — bucket name (R2_BUCKET is also accepted)
  • R2_PUBLIC_BASE_URL — public download base (R2 bucket → Settings → Public access → r2.dev URL or custom domain)
 Optional: R2_OBJECT_PREFIX to prefix object keys.
 Do not use the S3 API URL as the public URL — browsers need the r2.dev / custom domain.
`);
}

function getR2Config() {
  const endpointRaw = (
    process.env.CLOUDFLARE_S3_API ||
    process.env.R2_S3_ENDPOINT ||
    process.env.R2_ENDPOINT ||
    process.env.AWS_ENDPOINT_URL ||
    ''
  ).trim();
  const accountId = (process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
  const endpoint = endpointRaw
    ? endpointRaw.replace(/\/$/, '')
    : accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : null;

  const accessKeyId = (
    process.env.R2_ACCESS_KEY_ID ||
    ''
  ).trim();
  const secretAccessKey = (
    process.env.R2_SECRET_ACCESS_KEY ||
    ''
  ).trim();
  const bucket = (
    process.env.R2_BUCKET_NAME ||
    process.env.R2_BUCKET ||
    process.env.CLOUDFLARE_R2_BUCKET ||
    ''
  ).trim();
  const publicBase = (
    process.env.R2_PUBLIC_BASE_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicBase) return null;
  return { endpoint, accessKeyId, secretAccessKey, bucket, publicBase };
}

/** Why R2 is disabled (no secret values printed). Uses same names as getR2Config(). */
function logR2Diagnostics() {
  const endpointRaw = (
    process.env.CLOUDFLARE_S3_API ||
    process.env.R2_S3_ENDPOINT ||
    process.env.R2_ENDPOINT ||
    process.env.AWS_ENDPOINT_URL ||
    ''
  ).trim();
  const accountId = (process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
  const hasEndpoint = Boolean(endpointRaw || accountId);

  const accessKeyId = (
    process.env.R2_ACCESS_KEY_ID ||
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    ''
  ).trim();
  const secretAccessKey = (
    process.env.R2_SECRET_ACCESS_KEY ||
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    ''
  ).trim();
  const bucket = (
    process.env.R2_BUCKET ||
    process.env.CLOUDFLARE_R2_BUCKET ||
    process.env.R2_BUCKET_NAME ||
    ''
  ).trim();
  const publicBase = (
    process.env.R2_PUBLIC_BASE_URL || process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || ''
  ).trim();

  const missing = [];
  if (!hasEndpoint) {
    missing.push('CLOUDFLARE_S3_API (or R2_S3_ENDPOINT / R2_ENDPOINT / R2_ACCOUNT_ID)');
  }
  if (!accessKeyId) missing.push('R2_ACCESS_KEY_ID (or AWS_ACCESS_KEY_ID)');
  if (!secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY (or AWS_SECRET_ACCESS_KEY)');
  if (!bucket) missing.push('R2_BUCKET_NAME (or R2_BUCKET / CLOUDFLARE_R2_BUCKET)');
  if (!publicBase) missing.push('R2_PUBLIC_BASE_URL');
  if (missing.length === 0) return;

  console.error(`\nR2 disabled — empty or unset: ${missing.join(', ')}`);
  console.error(
    '(Merged from .env files; empty shell vars no longer block .env. Unset a var: unset VAR_NAME)\n'
  );
  if (
    publicBase &&
    (publicBase.includes('r2.cloudflarestorage.com') || publicBase.includes('amazonaws.com'))
  ) {
    console.error(
      'Tip: R2_PUBLIC_BASE_URL must be your public r2.dev URL or custom domain, not the S3 API host.\n'
    );
  }
}

function getSupabaseAdmin() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
    .trim()
    .replace(/\/$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function maxCloudinaryBytes() {
  const raw = process.env.RESOURCE_ZIP_MAX_CLOUDINARY_BYTES;
  if (raw) {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return DEFAULT_MAX_CLOUDINARY;
}

function toDownloadKey(absPath) {
  const rel = relative(join(ROOT, 'public', 'resources'), absPath);
  return rel.split('\\').join('/');
}

function listZips() {
  if (!existsSync(FILES_DIR)) {
    console.error('Missing folder:', relative(ROOT, FILES_DIR));
    process.exit(1);
  }
  const names = readdirSync(FILES_DIR).filter((n) => n.toLowerCase().endsWith('.zip'));
  return names
    .map((n) => join(FILES_DIR, n))
    .filter((p) => statSync(p).isFile())
    .sort();
}

/** Parse existing generated TS (JSON-string keys/values) for incremental uploads. */
function loadExistingManifest() {
  if (!existsSync(OUT_FILE)) return {};
  const text = readFileSync(OUT_FILE, 'utf8');
  const out = {};
  const re = /^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*,?\s*$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    try {
      const k = JSON.parse(m[1]);
      const v = JSON.parse(m[2]);
      if (typeof k === 'string' && typeof v === 'string' && v.length > 0) out[k] = v;
    } catch {
      /* skip */
    }
  }
  return out;
}

function writeGeneratedTs(map) {
  const lines = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, url]) => `  ${JSON.stringify(k)}: ${JSON.stringify(url)}`);
  const body = `${lines.join(',\n')}`;
  const ts = `/**
 * Auto-generated by scripts/upload-resource-zips.mjs
 * Do not edit by hand — run: npm run upload:resource-zips
 */
export const RESOURCE_ZIP_CLOUDINARY_URLS: Record<string, string> = {
${body}
};
`;
  writeFileSync(OUT_FILE, ts, 'utf8');
  console.log('Wrote', relative(ROOT, OUT_FILE));
}

async function uploadCloudinary(absPath, key) {
  const folder = process.env.CLOUDINARY_RESOURCE_FOLDER || DEFAULT_CLOUDINARY_FOLDER;
  const res = await cloudinary.uploader.upload(absPath, {
    resource_type: 'raw',
    folder,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    invalidate: true
  });
  if (!res.secure_url) {
    throw new Error(`Cloudinary: no secure_url for ${key}`);
  }
  return res.secure_url;
}

async function uploadR2(cfg, absPath, downloadKey) {
  const prefix = (process.env.R2_OBJECT_PREFIX || '').replace(/^\/+|\/+$/g, '');
  const objectKey = prefix ? `${prefix}/${downloadKey}` : downloadKey;

  const client = new S3Client({
    region: 'auto',
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey
    }
  });

  const body = readFileSync(absPath);
  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: objectKey,
      Body: body,
      ContentType: 'application/zip'
    })
  );

  const pathEncoded = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${cfg.publicBase}/${pathEncoded}`;
}

async function uploadSupabase(supabase, bucket, absPath, key) {
  const buf = readFileSync(absPath);
  const { error } = await supabase.storage.from(bucket).upload(key, buf, {
    contentType: 'application/zip',
    upsert: true
  });
  if (error) throw new Error(`Supabase upload ${key}: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  if (!data?.publicUrl) throw new Error(`Supabase: no publicUrl for ${key}`);
  return data.publicUrl;
}

async function main() {
  loadAllEnv();
  const dry =
    process.env.RESOURCE_ZIPS_DRY_RUN === '1' || process.argv.includes('--dry-run');
  const forceAll = process.argv.includes('--force');
  const onlyMissing =
    process.env.RESOURCE_ZIPS_ONLY_MISSING === '1' ||
    process.argv.includes('--only-missing');
  const forceSupabase = process.env.RESOURCE_ZIPS_FORCE_SUPABASE === '1';
  const paths = listZips();
  if (paths.length === 0) {
    console.error('No .zip files in', relative(ROOT, FILES_DIR));
    process.exit(1);
  }

  const maxCld = maxCloudinaryBytes();
  const hasCld = !forceSupabase && configureCloudinary();
  const r2 = getR2Config();
  const supabase = getSupabaseAdmin();
  const sbBucket = process.env.SUPABASE_RESOURCE_BUCKET || DEFAULT_BUCKET;

  if (!r2) logR2Diagnostics();

  const priorManifest = forceAll ? {} : loadExistingManifest();
  const map = { ...priorManifest };

  const pathsToUpload = paths.filter((abs) => {
    const key = toDownloadKey(abs);
    if (onlyMissing && !forceAll && map[key]) return false;
    return true;
  });

  console.log('ZIPs on disk:', paths.length);
  console.log(
    'Mode:',
    onlyMissing && !forceAll ? 'only-missing' : forceAll ? 'force (re-upload all)' : 'full'
  );
  if (onlyMissing && !forceAll && paths.length > pathsToUpload.length) {
    console.log(
      'Skipping (already in manifest):',
      paths.length - pathsToUpload.length,
      '— use --force to re-upload everything.'
    );
  }
  console.log('Cloudinary:', hasCld ? `yes (≤ ${(maxCld / 1024 / 1024).toFixed(1)} MiB)` : 'no');
  console.log('R2:', r2 ? `yes (bucket: ${r2.bucket})` : 'no');
  console.log('Supabase:', supabase ? `yes (bucket: ${sbBucket})` : 'no');

  for (const p of paths) {
    const bytes = statSync(p).size;
    const key = toDownloadKey(p);
    const skip = onlyMissing && !forceAll && priorManifest[key];
    console.log(
      ` • ${relative(ROOT, p)} (${(bytes / 1024 / 1024).toFixed(2)} MiB)${skip ? '  [skip]' : ''}`
    );
  }

  if (dry) {
    console.log('\nDry run: no uploads.');
    return;
  }

  if (pathsToUpload.length === 0) {
    console.log('\nNothing to upload. Manifest already has all current .zip keys.');
    return;
  }

  const needsBigUpload = pathsToUpload.some((p) => {
    const bytes = statSync(p).size;
    return !(hasCld && !forceSupabase && bytes <= maxCld);
  });

  if (!hasCld && !r2 && !supabase) {
    console.error('Need Cloudinary and/or R2 and/or Supabase for uploads.');
    explainR2Missing();
    process.exit(1);
  }

  if (needsBigUpload && !forceSupabase && !r2 && !supabase) {
    console.error('\nAborting: large .zips need R2 or Supabase.');
    explainR2Missing();
    explainSupabaseMissing();
    process.exit(1);
  }

  if (needsBigUpload && forceSupabase && !supabase) {
    console.error('\nAborting: RESOURCE_ZIPS_FORCE_SUPABASE=1 but Supabase is not configured.');
    explainSupabaseMissing();
    process.exit(1);
  }

  for (const abs of pathsToUpload) {
    const key = toDownloadKey(abs);
    const bytes = statSync(abs).size;
    const useCloudinary = hasCld && !forceSupabase && bytes <= maxCld;

    let dest = 'Supabase';
    if (useCloudinary) dest = 'Cloudinary';
    else if (!forceSupabase && r2) dest = 'R2';
    else if (supabase) dest = 'Supabase';
    else dest = 'R2';

    console.log(`\nUpload ${key} → ${dest}`);

    if (useCloudinary) {
      const url = await uploadCloudinary(abs, key);
      map[key] = url;
      console.log(' →', url);
    } else if (!forceSupabase && r2) {
      const url = await uploadR2(r2, abs, key);
      map[key] = url;
      console.log(' →', url);
    } else if (supabase) {
      const url = await uploadSupabase(supabase, sbBucket, abs, key);
      map[key] = url;
      console.log(' →', url);
    } else {
      console.error(`Cannot upload ${key}: configure R2 or Supabase.`);
      process.exit(1);
    }
    writeGeneratedTs(map);
  }

  console.log('\nDone. Commit', relative(ROOT, OUT_FILE));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
