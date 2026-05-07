import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import { ArrowRight } from 'lucide-react';
import { newsletterSchema } from '../schemas/forms';
import { ApiError, subscribeNewsletter, type SubscribeInput } from '../lib/api';
import { toast } from '../lib/toast';

interface NewsletterFormProps {
  variant: 'footer' | 'resources_card';
  source?: SubscribeInput['source'];
}

interface Values {
  firstName: string;
  email: string;
}

const initial: Values = { firstName: '', email: '' };

export const NewsletterForm = ({
  variant,
  source = variant === 'footer' ? 'footer' : 'resources_page'
}: NewsletterFormProps) => {
  const handleSubmit = async (
    values: Values,
    helpers: FormikHelpers<Values>
  ): Promise<void> => {
    try {
      await subscribeNewsletter({
        email: values.email.trim(),
        firstName: values.firstName.trim() || undefined,
        source
      });
      toast.success('You are subscribed — welcome to Checkmate Studios!');
      helpers.resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) helpers.setErrors(err.fieldErrors as Partial<Values>);
        toast.error(err.message);
      } else {
        toast.error('Could not subscribe — please try again.');
      }
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initial}
      validationSchema={newsletterSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) =>
        variant === 'footer' ? (
          <Form noValidate>
            <div className="flex gap-4">
              <div className="flex-1">
                <Field
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  aria-label="Email address"
                  className="w-full bg-gray-100 rounded-lg px-6 py-4 outline-none focus:ring-2 ring-brand-orange/20 transition-all"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-xs text-red-500 mt-2"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-label="Subscribe to newsletter"
                className="bg-brand-orange w-14 h-14 rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-60"
              >
                {isSubmitting ? '…' : '→'}
              </button>
            </div>
          </Form>
        ) : (
          <Form noValidate className="w-full">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1 border-b border-white/20 pb-4 w-full">
                <p className="text-[10px] text-white/40 mb-2 uppercase tracking-[0.2em] font-bold">
                  Your First Name
                </p>
                <Field
                  name="firstName"
                  type="text"
                  placeholder="John"
                  className="bg-transparent w-full outline-none text-xl placeholder:text-white/10"
                />
                <ErrorMessage
                  name="firstName"
                  component="p"
                  className="text-xs text-red-300 mt-1"
                />
              </div>
              <div className="flex-[1.5] flex items-end gap-4 border-b border-white/20 pb-4 w-full">
                <div className="flex-1">
                  <p className="text-[10px] text-white/40 mb-2 uppercase tracking-[0.2em] font-bold">
                    Email Address
                  </p>
                  <Field
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="bg-transparent w-full outline-none text-xl placeholder:text-white/10"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-xs text-red-300 mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Subscribe"
                  className="bg-brand-orange w-12 h-12 rounded-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-60 shadow-xl shadow-brand-orange/20 flex-shrink-0"
                >
                  <ArrowRight className="text-white" size={20} />
                </button>
              </div>
            </div>
          </Form>
        )
      }
    </Formik>
  );
};
