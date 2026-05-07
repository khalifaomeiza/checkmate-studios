/**
 * Shared CORS helpers for Checkmate Studios Edge Functions.
 *
 * Edge Functions are invoked from the browser, so every response must
 * carry the right CORS headers and every function must handle the
 * preflight OPTIONS request.
 */

const ALLOWED_ORIGINS = new Set<string>([
  'http://localhost:3000',
  'http://localhost:5173',
  'https://www.studiocheckmate.com',
  'https://studiocheckmate.com'
]);

const isAllowed = (origin: string | null): boolean => {
  if (!origin) return true; // server-to-server / curl
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Allow any *.studiocheckmate.com previews
  return /\.studiocheckmate\.com$/.test(new URL(origin).hostname);
};

export const corsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = isAllowed(origin) ? origin ?? '*' : 'null';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin'
  };
};

export const handlePreflight = (req: Request): Response | null => {
  if (req.method !== 'OPTIONS') return null;
  return new Response('ok', {
    headers: corsHeaders(req.headers.get('origin'))
  });
};
