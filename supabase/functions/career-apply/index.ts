// Career application Edge Function
// Endpoint: POST {SUPABASE_URL}/functions/v1/career-apply  (multipart/form-data)
//
// Form fields: jobId, jobTitle, fullName, email, portfolioUrl?, coverLetter?
// File field:  resume (PDF / DOC / DOCX, ≤ 10MB)

import { handlePreflight } from '../_shared/cors.ts';
import { created, fail, requestMeta } from '../_shared/respond.ts';
import { validateCareer } from '../_shared/validators.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { sendEmail, ADMIN_EMAIL } from '../_shared/resend.ts';
import {
  careerAdminEmail,
  careerApplicantEmail
} from '../_shared/templates/career.ts';

const RESUME_BUCKET = 'resumes';
const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return fail(405, 'Method not allowed', origin);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'Invalid form data', origin);
  }

  const fields: Record<string, unknown> = {
    jobId: form.get('jobId'),
    jobTitle: form.get('jobTitle'),
    fullName: form.get('fullName'),
    email: form.get('email'),
    portfolioUrl: form.get('portfolioUrl') ?? undefined,
    coverLetter: form.get('coverLetter') ?? undefined
  };

  const result = validateCareer(fields);
  if (!result.ok) return fail(400, 'Validation failed', origin, result.errors);

  const resume = form.get('resume');
  if (!(resume instanceof File)) {
    return fail(400, 'Resume file is required.', origin);
  }
  if (!ALLOWED_RESUME_TYPES.has(resume.type)) {
    return fail(400, 'Resume must be PDF or DOCX.', origin);
  }
  if (resume.size > MAX_RESUME_BYTES) {
    return fail(400, 'Resume must be under 10MB.', origin);
  }

  const { jobId, jobTitle, fullName, email, portfolioUrl, coverLetter } = result.value;
  const meta = requestMeta(req);
  const supabase = createServiceClient();

  // Upload resume to Storage
  const safeName = resume.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectPath = `${jobId}/${Date.now()}-${safeName}`;
  const buffer = new Uint8Array(await resume.arrayBuffer());

  const upload = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(objectPath, buffer, { contentType: resume.type, upsert: false });

  if (upload.error) {
    console.error('Resume upload error', upload.error);
    return fail(500, 'We could not upload your resume — please try again.', origin);
  }

  const { data: publicUrlData } = supabase.storage
    .from(RESUME_BUCKET)
    .getPublicUrl(objectPath);
  const resumeUrl = publicUrlData.publicUrl;

  // Insert application row
  const { data, error: writeError } = await supabase
    .from('career_applications')
    .insert({
      job_id: jobId,
      job_title: jobTitle,
      full_name: fullName,
      email,
      portfolio_url: portfolioUrl ?? null,
      resume_url: resumeUrl,
      resume_name: safeName,
      cover_letter: coverLetter ?? null,
      ip_address: meta.ipAddress,
      user_agent: meta.userAgent
    })
    .select('id, submitted_at')
    .single();

  if (writeError) {
    console.error('Career application write error', writeError);
    return fail(500, 'We could not record your application — please try again.', origin);
  }

  // Fire-and-forget emails
  const resumeBase64 = bytesToBase64(buffer);
  EdgeRuntime.waitUntil(
    (async () => {
      const applicant = careerApplicantEmail({ fullName, email, jobTitle, jobId });
      const admin = careerAdminEmail({
        fullName,
        email,
        jobTitle,
        jobId,
        portfolioUrl,
        resumeUrl,
        resumeName: safeName,
        coverLetter
      });

      await Promise.all([
        sendEmail({ to: email, subject: applicant.subject, html: applicant.html }),
        sendEmail({
          to: ADMIN_EMAIL,
          subject: admin.subject,
          html: admin.html,
          attachments: [{ filename: safeName, content: resumeBase64 }]
        })
      ]);
    })()
  );

  return created('Application submitted — we will be in touch soon.', data, origin);
});

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in the Edge Functions runtime
  return btoa(binary);
};

declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };
