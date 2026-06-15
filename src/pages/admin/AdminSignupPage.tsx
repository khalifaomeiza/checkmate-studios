import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { adminSignup } from '../../lib/case-study-admin';

const schema = Yup.object({
  fullName: Yup.string().trim().required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
  inviteCode: Yup.string().trim().required('Invite code is required')
});

export const AdminSignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-8 md:p-10 shadow-sm"
      >
        <Link to="/" className="text-xl font-medium tracking-tighter block mb-8">
          checkmate
        </Link>
        <h1 className="text-3xl font-normal tracking-tight mb-2">Create studio account</h1>
        <p className="text-gray-500 mb-8">Invite-only access for Checkmate editors.</p>

        <Formik
          initialValues={{ fullName: '', email: '', password: '', inviteCode: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            try {
              await adminSignup(values);
              navigate('/admin/login', {
                replace: true,
                state: { message: 'Account created — sign in to continue.' }
              });
            } catch (e) {
              setStatus(e instanceof Error ? e.message : 'Signup failed.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status, errors, touched }) => (
            <Form className="space-y-5">
              {(['fullName', 'email', 'password', 'inviteCode'] as const).map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400"
                  >
                    {field === 'fullName'
                      ? 'Full name'
                      : field === 'inviteCode'
                        ? 'Invite code'
                        : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <Field
                    id={field}
                    name={field}
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    className="mt-2 w-full border-b border-black/15 bg-transparent py-3 outline-none focus:border-brand-orange"
                  />
                  {touched[field] && errors[field] ? (
                    <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
                  ) : null}
                </div>
              ))}
              {status ? <p className="text-sm text-red-500">{status}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-brand-black text-white py-4 font-medium hover:bg-brand-orange transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-8 text-sm text-gray-500">
          Already have access?{' '}
          <Link to="/admin/login" className="text-brand-orange font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
