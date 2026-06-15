type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

const header = (req: VercelRequest, name: string) => {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

const cronSecret = () =>
  process.env.CRON_SECRET ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';

const isAuthorized = (req: VercelRequest) => {
  const secret = cronSecret();
  const auth = header(req, 'authorization');

  if (secret && auth === `Bearer ${secret}`) return true;

  // Vercel cron invocations when CRON_SECRET is not set on the project
  if (header(req, 'x-vercel-cron') === '1') return true;

  return process.env.NODE_ENV !== 'production';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const base = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';

  if (!base || !key) {
    return res.status(500).json({
      ok: false,
      error: 'Missing SUPABASE_URL and Supabase key in Vercel environment variables.'
    });
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json'
  };

  try {
    const [health, db] = await Promise.all([
      fetch(`${base}/auth/v1/health`, { headers: { apikey: key } }),
      fetch(`${base}/rest/v1/newsletter_subscribers?select=id&limit=1`, { headers })
    ]);

    const ok = health.ok && db.ok;

    return res.status(ok ? 200 : 502).json({
      ok,
      at: new Date().toISOString(),
      checks: {
        auth: health.status,
        database: db.status
      }
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      at: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Keep-alive failed'
    });
  }
}
