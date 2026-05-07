// Contact form Edge Function
// Endpoint: POST {SUPABASE_URL}/functions/v1/contact-submit
//
// Body: { name, email, service?, budget?, projectDetails?, source? }

import { handlePreflight } from '../_shared/cors.ts';
import { created, fail, requestMeta } from '../_shared/respond.ts';
import { validateContact } from '../_shared/validators.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { sendEmail, ADMIN_EMAIL } from '../_shared/resend.ts';
import { contactAdminEmail, contactUserEmail } from '../_shared/templates/contact.ts';

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

  const result = validateContact(body);
  if (!result.ok) return fail(400, 'Validation failed', origin, result.errors);

  const { name, email, service, budget, projectDetails, source } = result.value;
  const meta = requestMeta(req);
  const supabase = createServiceClient();

  const { data, error: writeError } = await supabase
    .from('contact_submissions')
    .insert({
      name,
      email,
      service: service ?? null,
      budget: budget ?? null,
      project_details: projectDetails ?? null,
      source,
      ip_address: meta.ipAddress,
      user_agent: meta.userAgent
    })
    .select('id, submitted_at')
    .single();

  if (writeError) {
    console.error('Contact write error', writeError);
    return fail(
      500,
      'We could not save your message — please try again or email hello@studiocheckmate.com.',
      origin
    );
  }

  EdgeRuntime.waitUntil(
    (async () => {
      const userTpl = contactUserEmail({ name, email, service, budget, projectDetails });
      const adminTpl = contactAdminEmail({ name, email, service, budget, projectDetails });
      await Promise.all([
        sendEmail({ to: email, subject: userTpl.subject, html: userTpl.html }),
        sendEmail({ to: ADMIN_EMAIL, subject: adminTpl.subject, html: adminTpl.html })
      ]);
    })()
  );

  return created('Message received — we will get back to you within 24 hours.', data, origin);
});

declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };
