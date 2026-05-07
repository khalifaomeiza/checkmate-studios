/**
 * Resend wrapper for Edge Functions.
 *
 * We call Resend's REST API directly with fetch instead of pulling in
 * the npm:resend SDK — keeps cold start low and works in pure Deno.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM_EMAIL = Deno.env.get('EMAIL_USER') ?? 'hello@studiocheckmate.com';
const FROM_HEADER = `Checkmate Studios <${FROM_EMAIL}>`;

export const ADMIN_EMAIL =
  Deno.env.get('ADMIN_EMAIL_USER') ?? 'admin@studiocheckmate.com';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  attachments?: Array<{ filename: string; content: string }>; // base64 content
}

export const sendEmail = async (input: SendEmailInput): Promise<boolean> => {
  const apiKey = Deno.env.get('STUDIOS_CHECKMATE_RESEND_API_KEY');
  if (!apiKey) {
    console.error('Missing STUDIOS_CHECKMATE_RESEND_API_KEY');
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_HEADER,
        to: input.to,
        cc: input.cc,
        subject: input.subject,
        html: input.html,
        attachments: input.attachments
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ Resend API error', res.status, text);
      return false;
    }

    const data = await res.json();
    console.log('✅ Email sent', { id: data?.id, to: input.to, subject: input.subject });
    return true;
  } catch (error) {
    console.error('❌ Resend send failed:', error);
    return false;
  }
};
