import * as Yup from 'yup';

/**
 * Yup schemas used by Formik forms.
 * Mirrors the server-side Joi schemas in /server/src/validators
 * so client and server validate identically.
 */

const email = Yup.string()
  .trim()
  .lowercase()
  .email('Please enter a valid email address')
  .required('Email is required');

export const newsletterSchema = Yup.object({
  email,
  firstName: Yup.string().trim().max(100, 'First name is too long').optional()
});

export const contactSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .required('Name is required'),
  email,
  service: Yup.string().trim().max(100).optional(),
  budget: Yup.string().trim().max(50).optional(),
  projectDetails: Yup.string()
    .trim()
    .max(2000, 'Project details cannot exceed 2000 characters')
    .optional()
});

const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const careerApplicationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .required('Full name is required'),
  email,
  portfolioUrl: Yup.string()
    .trim()
    .url('Portfolio link must be a valid URL')
    .max(500)
    .optional(),
  coverLetter: Yup.string().trim().max(4000, 'Cover letter is too long').optional(),
  resume: Yup.mixed<File>()
    .required('Resume is required')
    .test(
      'fileType',
      'Resume must be PDF or DOCX',
      (file) => !!file && ALLOWED_RESUME_TYPES.includes((file as File).type)
    )
    .test(
      'fileSize',
      'Resume must be under 10MB',
      (file) => !!file && (file as File).size <= 10 * 1024 * 1024
    )
});
