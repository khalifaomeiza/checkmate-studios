import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import { ArrowRight, Upload } from 'lucide-react';
import { careerApplicationSchema } from '../schemas/forms';
import { ApiError, submitCareerApplication } from '../lib/api';
import { toast } from '../lib/toast';

interface Job {
  id: string | number;
  title: string;
  description: string;
}

interface Props {
  job: Job;
  onSuccess: () => void;
}

interface Values {
  fullName: string;
  email: string;
  portfolioUrl: string;
  coverLetter: string;
  resume: File | null;
}

const initial: Values = {
  fullName: '',
  email: '',
  portfolioUrl: '',
  coverLetter: '',
  resume: null
};

export const CareerApplicationForm = ({ job, onSuccess }: Props) => {
  const handleSubmit = async (
    values: Values,
    helpers: FormikHelpers<Values>
  ): Promise<void> => {
    if (!values.resume) {
      helpers.setFieldError('resume', 'Resume is required');
      helpers.setSubmitting(false);
      return;
    }

    try {
      await submitCareerApplication({
        jobId: job.id,
        jobTitle: job.title,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        portfolioUrl: values.portfolioUrl.trim() || undefined,
        coverLetter: values.coverLetter.trim() || undefined,
        resume: values.resume
      });
      toast.success('Application submitted — we will be in touch.');
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {

          helpers.setErrors(err.fieldErrors as unknown as Record<keyof Values, string>);
        }
        toast.error(err.message);
      } else {
        toast.error('Could not submit your application — please try again.');
      }
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initial}
      validationSchema={careerApplicationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, setFieldTouched }) => (
        <Form noValidate className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">
                Full Name
              </label>
              <Field
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                className="w-full bg-gray-50 border-b-2 border-transparent focus:border-brand-orange px-4 py-4 outline-none transition-all rounded-t-xl"
              />
              <ErrorMessage name="fullName" component="p" className="text-xs text-red-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">
                Email Address
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="w-full bg-gray-50 border-b-2 border-transparent focus:border-brand-orange px-4 py-4 outline-none transition-all rounded-t-xl"
              />
              <ErrorMessage name="email" component="p" className="text-xs text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="portfolioUrl" className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">
              Portfolio Link (Optional)
            </label>
            <Field
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              placeholder="https://behance.net/johndoe"
              className="w-full bg-gray-50 border-b-2 border-transparent focus:border-brand-orange px-4 py-4 outline-none transition-all rounded-t-xl"
            />
            <ErrorMessage name="portfolioUrl" component="p" className="text-xs text-red-500" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">Resume / CV</span>
            <label className="relative group block cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setFieldValue('resume', file);
                  setFieldTouched('resume', true, false);
                }}
              />
              <div className="w-full border-2 border-dashed border-gray-200 group-hover:border-brand-orange p-8 rounded-2xl flex flex-col items-center justify-center gap-4 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-colors">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <p className="font-medium">
                    {values.resume ? values.resume.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOCX up to 10MB</p>
                </div>
              </div>
            </label>
            <ErrorMessage name="resume" component="p" className="text-xs text-red-500" />
          </div>

          <div className="space-y-2">
            <label htmlFor="coverLetter" className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">
              Cover Letter / Message
            </label>
            <Field
              as="textarea"
              id="coverLetter"
              name="coverLetter"
              rows={4}
              placeholder="Tell us why you're a great fit…"
              className="w-full bg-gray-50 border-b-2 border-transparent focus:border-brand-orange px-4 py-4 outline-none transition-all rounded-t-xl resize-none"
            />
            <ErrorMessage name="coverLetter" component="p" className="text-xs text-red-500" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-black text-white py-6 rounded-2xl font-medium text-lg hover:bg-brand-orange transition-colors flex items-center justify-center gap-3 group disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Application'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Form>
      )}
    </Formik>
  );
};
