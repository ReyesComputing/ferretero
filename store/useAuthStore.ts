import { create } from 'zustand';
import { Profile } from '../types/database';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile, loading: false }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, loading: false });
  },
}));
