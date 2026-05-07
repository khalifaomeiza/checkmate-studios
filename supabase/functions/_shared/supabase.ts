// @ts-ignore — npm: specifier resolved by Deno runtime in Supabase Edge Functions
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

/**
 * Server-side Supabase client used inside Edge Functions.
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
 * by the Supabase Functions runtime — we never have to pass them.
 *
 * The service role key bypasses RLS by design, which is what we want for
 * trusted server logic (insert + storage upload).
 */
export const createServiceClient = (): SupabaseClient => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};
