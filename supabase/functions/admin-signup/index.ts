// Admin signup — POST { email, password, fullName, inviteCode }
// Creates auth user + profiles row when invite code matches ADMIN_INVITE_CODE.

import { handlePreflight, corsHeaders } from '../_shared/cors.ts';
import { fail, ok } from '../_shared/respond.ts';
import { createServiceClient } from '../_shared/supabase.ts';

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return fail(405, 'Method not allowed', origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Invalid JSON body', origin);
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const fullName = String(body.fullName ?? '').trim();
  const inviteCode = String(body.inviteCode ?? '').trim();

  if (!email || !password || password.length < 8) {
    return fail(400, 'Email and password (min 8 characters) are required.', origin);
  }

  const expected = Deno.env.get('ADMIN_INVITE_CODE');
  if (!expected || inviteCode !== expected) {
    return fail(403, 'Invalid invite code.', origin);
  }

  const supabase = createServiceClient();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (createError || !created.user) {
    console.error('admin-signup createUser', createError);
    return fail(400, createError?.message ?? 'Could not create account.', origin);
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: created.user.id,
    email,
    full_name: fullName || null,
    role: 'editor'
  });

  if (profileError) {
    console.error('admin-signup profile', profileError);
    await supabase.auth.admin.deleteUser(created.user.id);
    return fail(500, 'Could not create profile.', origin);
  }

  return ok('Account created — you can sign in now.', { userId: created.user.id }, origin);
});
