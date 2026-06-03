import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  hydrated: false,

  login: (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: true, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },
}));