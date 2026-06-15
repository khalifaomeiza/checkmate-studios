import { createClient } from 'npm:@supabase/supabase-js@2';
import type { User } from 'npm:@supabase/supabase-js@2';

export const createUserClient = (jwt: string) => {
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');

  if (!url || !anon) throw new Error('Missing Supabase env');

  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

export const requireEditor = async (req: Request): Promise<{ user: User; jwt: string }> => {
  const authHeader = req.headers.get('authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!jwt) throw new Error('Missing authorization token');

  const client = createUserClient(jwt);
  const { data, error } = await client.auth.getUser(jwt);

  if (error || !data.user) throw new Error('Invalid session');

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError || !profile || !['admin', 'editor'].includes(profile.role)) {
    throw new Error('You do not have editor access.');
  }

  return { user: data.user, jwt };
};
