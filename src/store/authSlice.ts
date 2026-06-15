import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { StudioProfile } from '../types/case-study';
import { fetchProfile, initialState, writeCachedProfile } from './authState';

export const loadProfile = createAsyncThunk(
  'auth/loadProfile',
  async (userId: string, { getState }) => {
    const auth = (getState() as AuthRootState).auth;
    return fetchProfile(userId, auth);
  },
  {
    condition: (userId, { getState }) => {
      const auth = (getState() as AuthRootState).auth;
      if (auth.profileLoading && auth.profileLoadedFor === userId) return false;
      if (auth.profileLoadedFor === userId && auth.profile?.id === userId) return false;
      return true;
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session?.user?.id) {
      await dispatch(loadProfile(data.session.user.id));
    }
    return data.session;
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
  writeCachedProfile(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
    },
    setAuthReady(state, action: PayloadAction<boolean>) {
      state.authReady = action.payload;
    },
    clearAuth(state) {
      state.session = null;
      state.profile = null;
      state.profileLoadedFor = null;
      state.profileLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProfile.pending, (state, action) => {
        state.profileLoading = true;
        state.profileLoadedFor = action.meta.arg;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.profileLoadedFor = action.meta.arg;
        state.profileLoading = false;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.profile = null;
        state.profileLoadedFor = action.meta.arg;
        state.profileLoading = false;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.session = null;
        state.profile = null;
        state.profileLoadedFor = null;
        state.profileLoading = false;
      });
  }
});

export const { setSession, setAuthReady, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export type AuthRootState = { auth: typeof initialState };
