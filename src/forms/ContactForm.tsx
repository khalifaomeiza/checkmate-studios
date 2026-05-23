import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import { contactSchema } from '../schemas/forms';
import { ApiError, submitContact } from '../lib/api';
import { toast } from '../lib/toast';
import { cn } from '../lib/utils';

const SERVICES = [
  'Branding',
  'UI/UX',
  'Web development',
  'Illustration',
  'Advertisement',
  'Media'
] as const;

const BUDGETS = ['Below 1k', '1k - 5k', 'Above 5k'] as const;

interface Values {
  name: string;
  email: string;
  service: string;
  budget: string;
  projectDetails: string;
}

const initial: Values = {
  name: '',
  email: '',
  service: 'Branding',
  budget: '1k - 5k',
  projectDetails: ''
};

export const ContactForm = () => {
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const handleSubmit = async (
    values: Values,
    helpers: FormikHelpers<Values>
  ): Promise<void> => {
    try {
      await submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        service: values.service,
        budget: values.budget,
        projectDetails: values.projectDetails.trim() || undefined,
        source: 'contact_form'
      });
      setSubmittedAt(new Date());
      toast.success('Message received — we will be in touch within 24 hours.');
      helpers.resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) helpers.setErrors(err.fieldErrors as Partial<Values>);
        toast.error(err.message);
      } else {
        toast.error('Something went wrong — please try again.');
      }
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initial}
      validationSchema={contactSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form noValidate className="space-y-12">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/40 mb-4">
              services
            </p>
            <div className="flex flex-wrap gap-3">
              {SERVICES.map((service) => (
                <button
                  type="button"
                  key={service}
                  onClick={() => setFieldValue('service', service)}
                  className={cn(
                    'px-6 py-2 rounded-full text-sm transition-all',
                    values.service === service
                      ? 'bg-white text-brand-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-widest text-white/40 mb-4">
              Budget in USD
            </p>
            <div className="flex flex-wrap gap-3">
              {BUDGETS.map((budget) => (
                <button
                  type="button"
                  key={budget}
                  onClick={() => setFieldValue('budget', budget)}
                  className={cn(
                    'px-6 py-2 rounded-full text-sm transition-all',
                    values.budget === budget
                      ? 'bg-white text-brand-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {budget}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 border-b border-white/20 pb-2">
              <p className="text-xs text-white/40">Name</p>
              <Field
                name="name"
                type="text"
                placeholder="Your name"
                className="bg-transparent w-full outline-none text-lg placeholder:text-white/20"
              />
              <ErrorMessage name="name" component="p" className="text-xs text-red-300" />
            </div>
            <div className="space-y-2 border-b border-white/20 pb-2">
              <p className="text-xs text-white/40">Email</p>
              <Field
                name="email"
                type="email"
                placeholder="you@company.com"
                className="bg-transparent w-full outline-none text-lg placeholder:text-white/20"
              />
              <ErrorMessage name="email" component="p" className="text-xs text-red-300" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="flex-1 space-y-2 border-b border-white/20 pb-2 w-full">
              <p className="text-xs text-white/40">Project details (optional)</p>
              <Field
                as="textarea"
                name="projectDetails"
                rows={3}
                placeholder="Tell us about your project, timelines, references…"
                className="bg-transparent w-full outline-none text-lg resize-none placeholder:text-white/20"
              />
              <ErrorMessage
                name="projectDetails"
                component="p"
                className="text-xs text-red-300"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-4xl font-medium hover:text-brand-orange transition-colors group flex items-center gap-4 pb-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending…' : 'Submit'}
              <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
            </button>
          </div>

          {submittedAt ? (
            <p className="text-sm text-white/50">
              Submitted at {submittedAt.toLocaleTimeString()}. Reply landing soon.
            </p>
          ) : null}
        </Form>
      )}
    </Formik>
  );
};
