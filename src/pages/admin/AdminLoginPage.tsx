import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion } from 'motion/react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required')
});

export const AdminLoginPage = () => {
  const { signIn, authReady, session, profilePending, isEditor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/works';
  const signupMessage = (location.state as { message?: string } | null)?.message;

  if (authReady && session && !profilePending && isEditor) {
    return <Navigate to={from} replace />;
  }

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
        <h1 className="text-3xl font-normal tracking-tight mb-2">Studio sign in</h1>
        <p className="text-gray-500 mb-8">Manage case studies and upload new work.</p>
        {signupMessage ? (
          <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {signupMessage}
          </p>
        ) : null}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            try {
              await signIn(values.email, values.password);
              navigate(from, { replace: true });
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Sign in failed.';
              setStatus(
                message.includes('Invalid login credentials')
                  ? 'Incorrect email or password.'
                  : message
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status, errors, touched }) => (
            <Form className="space-y-5">
              <div>
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-2 w-full border-b border-black/15 bg-transparent py-3 outline-none focus:border-brand-orange"
                />
                {touched.email && errors.email ? (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="mt-2 w-full border-b border-black/15 bg-transparent py-3 outline-none focus:border-brand-orange"
                />
                {touched.password && errors.password ? (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                ) : null}
              </div>
              {status ? <p className="text-sm text-red-500">{status}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-brand-black text-white py-4 font-medium hover:bg-brand-orange transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-8 text-sm text-gray-500">
          Need an account?{' '}
          <Link to="/admin/signup" className="text-brand-orange font-medium hover:underline">
            Sign up with invite code
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
