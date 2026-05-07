// Newsletter subscription Edge Function
// Endpoint: POST {SUPABASE_URL}/functions/v1/newsletter-subscribe
//
// Body: { email: string; firstName?: string; source?: string }

import { handlePreflight } from '../_shared/cors.ts';
import { created, fail, ok, requestMeta } from '../_shared/respond.ts';
import { validateNewsletter } from '../_shared/validators.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { sendEmail } from '../_shared/resend.ts';
import { newsletterWelcomeEmail } from '../_shared/templates/newsletter.ts';

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return fail(405, 'Method not allowed', origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Invalid JSON body', origin);
  }

  const result = validateNewsletter(body);
  if (!result.ok) return fail(400, 'Validation failed', origin, result.errors);

  const { email, firstName, source } = result.value;
  const meta = requestMeta(req);
  const supabase = createServiceClient();

  const { data: existing, error: lookupError } = await supabase
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('email', email)
    .maybeSingle();

  if (lookupError) {
    console.error('Newsletter lookup error', lookupError);
    return fail(500, 'Could not process subscription, please try again.', origin);
  }

  if (existing && existing.status === 'active') {
    return fail(409, 'This email is already subscribed to our newsletter.', origin);
  }

  const payload = {
    email,
    first_name: firstName ?? null,
    source,
    status: 'active' as const,
    ip_address: meta.ipAddress,
    user_agent: meta.userAgent,
    subscribed_at: new Date().toISOString(),
    unsubscribed_at: null
  };

  const writeResult = existing
    ? await supabase
        .from('newsletter_subscribers')
        .update(payload)
        .eq('id', existing.id)
        .select('id, email, subscribed_at')
        .single()
    : await supabase
        .from('newsletter_subscribers')
        .insert(payload)
        .select('id, email, subscribed_at')
        .single();

  if (writeResult.error) {
    console.error('Newsletter write error', writeResult.error);
    return fail(500, 'Could not save your subscription, please try again.', origin);
  }

  // Fire-and-forget welcome email
  EdgeRuntime.waitUntil(
    (async () => {
      const tpl = newsletterWelcomeEmail({ email, firstName });
      await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
    })()
  );

  return existing
    ? ok('You are subscribed — welcome back to Checkmate Studios!', writeResult.data, origin)
    : created('You are subscribed — welcome to Checkmate Studios!', writeResult.data, origin);
});

// EdgeRuntime is provided by the Supabase Functions runtime — declare for TS.
declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };
