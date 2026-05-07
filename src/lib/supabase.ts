import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase client.
 * Uses the public ANON key — RLS policies (see supabase/schema.sql)
 * block direct anon writes; mutations should go through /api/* endpoints.
 *
 * Useful for: realtime feeds, public reads, auth flows, signed Storage URLs.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
} else if (typeof window !== 'undefined') {
  console.warn(
    'Supabase env vars missing — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = client;
