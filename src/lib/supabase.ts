import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase client.
 * Uses the public ANON key — RLS policies gate writes; editors mutate via JWT + RLS.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'checkmate-studios-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  });
} else if (typeof window !== 'undefined') {
  console.warn(
    'Supabase env vars missing — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = client;
