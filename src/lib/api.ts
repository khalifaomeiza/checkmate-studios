/**
 * Frontend API client for the Checkmate Studios Supabase Edge Functions.
 *
 * Endpoints live at `${SUPABASE_URL}/functions/v1/<function-name>` and
 * expect the anon key in the Authorization header.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

const FUNCTIONS_BASE = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1` : '';

export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const assertConfigured = (): void => {
  if (!FUNCTIONS_BASE || !SUPABASE_ANON_KEY) {
    throw new ApiError(
      'Supabase env not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      500
    );
  }
};

const baseHeaders = (): HeadersInit => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`
});

const parse = async <T>(res: Response): Promise<T | undefined> => {
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !json || json.success === false) {
    const fieldErrors =
      json && json.success === false && json.errors
        ? Object.fromEntries(json.errors.map((e) => [e.field, e.message]))
        : undefined;

    throw new ApiError(
      json?.message ?? `Request failed (${res.status})`,
      res.status,
      fieldErrors
    );
  }

  return json.data;
};

const callFunction = async <T>(
  name: string,
  body: BodyInit,
  headers: HeadersInit = {}
): Promise<T | undefined> => {
  assertConfigured();
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: { ...baseHeaders(), ...headers },
    body
  });
  return parse<T>(res);
};

const postJson = <T>(name: string, body: unknown) =>
  callFunction<T>(name, JSON.stringify(body), { 'Content-Type': 'application/json' });

const postForm = <T>(name: string, form: FormData) =>
  callFunction<T>(name, form);

// ----- Typed endpoints --------------------------------------------------

export interface SubscribeInput {
  email: string;
  firstName?: string;
  source?: string;
}

export const subscribeNewsletter = (input: SubscribeInput) =>
  postJson<{ id: string; email: string }>('newsletter-subscribe', input);

export interface ContactInput {
  name: string;
  email: string;
  service?: string;
  budget?: string;
  projectDetails?: string;
  source?: string;
}

export const submitContact = (input: ContactInput) =>
  postJson<{ id: string }>('contact-submit', input);

export interface CareerInput {
  jobId: string | number;
  jobTitle: string;
  fullName: string;
  email: string;
  portfolioUrl?: string;
  coverLetter?: string;
  resume: File;
}

export const submitCareerApplication = (input: CareerInput) => {
  const form = new FormData();
  form.set('jobId', String(input.jobId));
  form.set('jobTitle', input.jobTitle);
  form.set('fullName', input.fullName);
  form.set('email', input.email);
  if (input.portfolioUrl) form.set('portfolioUrl', input.portfolioUrl);
  if (input.coverLetter) form.set('coverLetter', input.coverLetter);
  form.set('resume', input.resume);
  return postForm<{ id: string }>('career-apply', form);
};
