import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { loadProfile, signIn as signInThunk, signOut as signOutThunk } from '../store/authSlice';

/** Redux-backed auth — same API as the old context hook. */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((s: RootState) => s.auth.session);
  const profile = useSelector((s: RootState) => s.auth.profile);
  const authReady = useSelector((s: RootState) => s.auth.authReady);
  const profileLoading = useSelector((s: RootState) => s.auth.profileLoading);
  const profileLoadedFor = useSelector((s: RootState) => s.auth.profileLoadedFor);

  const userId = session?.user?.id ?? null;
  const profilePending =
    Boolean(userId) && (profileLoading || profileLoadedFor !== userId);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await dispatch(signInThunk({ email, password })).unwrap();
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    await dispatch(signOutThunk()).unwrap();
  }, [dispatch]);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (userId) await dispatch(loadProfile(userId));
  }, [dispatch, session?.user?.id]);

  return {
    session,
    user: session?.user ?? null,
    profile,
    authReady,
    profileLoading,
    profilePending,
    isEditor: profile?.role === 'admin' || profile?.role === 'editor',
    signIn,
    signOut,
    refreshProfile
  };
};
