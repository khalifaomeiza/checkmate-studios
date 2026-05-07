/**
 * Lightweight validators for Edge Functions.
 *
 * We keep these dependency-free instead of pulling in Joi via npm: —
 * the rules mirror the Yup schemas in src/schemas/forms.ts so the
 * client and server reject the same inputs. Server is still source of truth.
 */

import type { FieldError } from './respond.ts';

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const NEWSLETTER_SOURCES = new Set([
  'website',
  'footer',
  'popup',
  'landing_page',
  'resources_page',
  'newsletter_card'
]);

export interface ValidationOk<T> {
  ok: true;
  value: T;
}

export interface ValidationFail {
  ok: false;
  errors: FieldError[];
}

export type ValidationResult<T> = ValidationOk<T> | ValidationFail;

const fail = (errors: FieldError[]): ValidationFail => ({ ok: false, errors });

const str = (v: unknown): string | undefined =>
  typeof v === 'string' ? v.trim() : undefined;

const requireStr = (
  field: string,
  v: unknown,
  min: number,
  max: number,
  errs: FieldError[]
): string | undefined => {
  const s = str(v);
  if (!s) {
    errs.push({ field, message: `${field} is required` });
    return undefined;
  }
  if (s.length < min) {
    errs.push({ field, message: `${field} must be at least ${min} characters` });
    return undefined;
  }
  if (s.length > max) {
    errs.push({ field, message: `${field} cannot exceed ${max} characters` });
    return undefined;
  }
  return s;
};

const requireEmail = (v: unknown, errs: FieldError[]): string | undefined => {
  const s = str(v);
  if (!s) {
    errs.push({ field: 'email', message: 'Email is required' });
    return undefined;
  }
  if (!EMAIL_RE.test(s)) {
    errs.push({ field: 'email', message: 'Please provide a valid email address' });
    return undefined;
  }
  return s.toLowerCase();
};

// ---------- Newsletter --------------------------------------------------

export interface NewsletterInput {
  email: string;
  firstName?: string;
  source: string;
}

export const validateNewsletter = (
  input: Record<string, unknown>
): ValidationResult<NewsletterInput> => {
  const errs: FieldError[] = [];

  const email = requireEmail(input.email, errs);
  const firstName = str(input.firstName);
  if (firstName && firstName.length > 100) {
    errs.push({ field: 'firstName', message: 'First name is too long' });
  }

  const sourceRaw = str(input.source) ?? 'website';
  const source = NEWSLETTER_SOURCES.has(sourceRaw) ? sourceRaw : 'website';

  if (errs.length || !email) return fail(errs);

  return { ok: true, value: { email, firstName, source } };
};

// ---------- Contact -----------------------------------------------------

export interface ContactInput {
  name: string;
  email: string;
  service?: string;
  budget?: string;
  projectDetails?: string;
  source: string;
}

export const validateContact = (
  input: Record<string, unknown>
): ValidationResult<ContactInput> => {
  const errs: FieldError[] = [];

  const name = requireStr('name', input.name, 2, 100, errs);
  const email = requireEmail(input.email, errs);
  const service = str(input.service);
  const budget = str(input.budget);
  const projectDetails = str(input.projectDetails);
  if (projectDetails && projectDetails.length > 2000) {
    errs.push({ field: 'projectDetails', message: 'Project details cannot exceed 2000 characters' });
  }
  const source = str(input.source) ?? 'contact_form';

  if (errs.length || !name || !email) return fail(errs);

  return {
    ok: true,
    value: { name, email, service, budget, projectDetails, source }
  };
};

// ---------- Career application -----------------------------------------

export interface CareerInput {
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  portfolioUrl?: string;
  coverLetter?: string;
}

export const validateCareer = (
  input: Record<string, unknown>
): ValidationResult<CareerInput> => {
  const errs: FieldError[] = [];

  const jobId = str(input.jobId);
  if (!jobId) errs.push({ field: 'jobId', message: 'Job reference is required' });

  const jobTitle = requireStr('jobTitle', input.jobTitle, 2, 200, errs);
  const fullName = requireStr('fullName', input.fullName, 2, 100, errs);
  const email = requireEmail(input.email, errs);

  const portfolioUrl = str(input.portfolioUrl);
  if (portfolioUrl && !URL_RE.test(portfolioUrl)) {
    errs.push({ field: 'portfolioUrl', message: 'Portfolio link must be a valid URL' });
  }

  const coverLetter = str(input.coverLetter);
  if (coverLetter && coverLetter.length > 4000) {
    errs.push({ field: 'coverLetter', message: 'Cover letter is too long' });
  }

  if (errs.length || !jobId || !jobTitle || !fullName || !email) return fail(errs);

  return {
    ok: true,
    value: { jobId, jobTitle, fullName, email, portfolioUrl, coverLetter }
  };
};
