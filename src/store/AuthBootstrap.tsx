import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase';
import type { AppDispatch } from './index';
import { clearAuth, loadProfile, setAuthReady, setSession } from './authSlice';
import { writeCachedProfile } from './authState';

/** One Supabase listener for the whole app. Profile is not refetched on TOKEN_REFRESHED. */
export const AuthBootstrap = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profileLoadedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      dispatch(setAuthReady(true));
      return;
    }

    let mounted = true;
    let bootstrapped = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      dispatch(setSession(session));
      if (session?.user?.id) {
        profileLoadedForRef.current = session.user.id;
        void dispatch(loadProfile(session.user.id));
      }
      bootstrapped = true;
      dispatch(setAuthReady(true));
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || !bootstrapped) return;

      dispatch(setSession(session));

      if (event === 'SIGNED_OUT') {
        profileLoadedForRef.current = null;
        writeCachedProfile(null);
        dispatch(clearAuth());
        return;
      }

      if (event === 'TOKEN_REFRESHED') return;

      const userId = session?.user?.id;
      if (!userId) return;

      if (
        (event === 'SIGNED_IN' || event === 'USER_UPDATED') &&
        profileLoadedForRef.current !== userId
      ) {
        profileLoadedForRef.current = userId;
        void dispatch(loadProfile(userId));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
};
