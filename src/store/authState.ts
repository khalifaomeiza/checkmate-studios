import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { StudioProfile } from '../types/case-study';

const PROFILE_CACHE_KEY = 'checkmate-studio-profile';

export interface AuthState {
  session: Session | null;
  profile: StudioProfile | null;
  authReady: boolean;
  /** User id the cached profile belongs to — avoids repeat network calls. */
  profileLoadedFor: string | null;
  profileLoading: boolean;
}

const initialState: AuthState = {
  session: null,
  profile: null,
  authReady: false,
  profileLoadedFor: null,
  profileLoading: false
};

const readCachedProfile = (userId: string): StudioProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudioProfile;
    return parsed?.id === userId ? parsed : null;
  } catch {
    return null;
  }
};

const writeCachedProfile = (profile: StudioProfile | null): void => {
  if (typeof window === 'undefined') return;
  if (!profile) {
    sessionStorage.removeItem(PROFILE_CACHE_KEY);
    return;
  }
  sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
};

/** Fetch profile once per user id (Redux + sessionStorage dedupe). */
export const fetchProfile = async (
  userId: string,
  current: Pick<AuthState, 'profile' | 'profileLoadedFor'>
): Promise<StudioProfile | null> => {
  if (current.profileLoadedFor === userId && current.profile?.id === userId) {
    return current.profile;
  }

  const cached = readCachedProfile(userId);
  if (cached) return cached;

  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[auth] profile load failed', error.message);
    throw error;
  }

  const profile = (data as StudioProfile | null) ?? null;
  if (profile) writeCachedProfile(profile);
  return profile;
};

export { initialState, writeCachedProfile };
