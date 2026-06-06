import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN' | 'PSYCHOLOGIST';
  phone?: string;
  faculty?: string;
  semester?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null });
        localStorage.removeItem('equilibria-auth'); // ← agrega esto
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: 'equilibria-auth' }
  )
);