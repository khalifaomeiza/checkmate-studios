import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BackButton } from '../ui/BackButton';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authReady, profilePending, isEditor, session, profile } = useAuth();
  const location = useLocation();

  if (!authReady || (session && profilePending)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isEditor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
        <h1 className="text-2xl font-medium tracking-tight mb-3">No editor access</h1>
        <p className="text-gray-500 max-w-md mb-2">
          You&apos;re signed in{profile?.email ? ` as ${profile.email}` : ''}, but this account
          doesn&apos;t have a studio profile yet.
        </p>
        <p className="text-sm text-gray-400 max-w-md mb-8">
          Sign up with an invite code, or ask an admin to add your user to the{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">profiles</code> table in Supabase.
        </p>
        <BackButton to="/admin/login" label="Back to Sign In" />
      </div>
    );
  }

  return children;
};
