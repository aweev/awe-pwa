// stores/authStore.ts
import { create } from "zustand";
import { AuthUser } from "@/lib/auth/auth.types"; // Our safe user type

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  mfaToken: string | null; // For the MFA step
  isInitializing: boolean; // To check if the app has loaded the session
  
  // Actions
  setAuth: (user: AuthUser, accessToken: string) => void;
  setMfaToken: (token: string | null) => void;
  setIsInitializing: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  mfaToken: null,
  isInitializing: true, // Start as true on app load

  setAuth: (user, accessToken) => set({ user, accessToken, mfaToken: null }),
  setMfaToken: (token) => set({ mfaToken: token, user: null, accessToken: null }),
  setIsInitializing: (status) => set({ isInitializing: status }),
  logout: () => set({ user: null, accessToken: null, mfaToken: null }),
}));

// Selector for derived state
export const useIsAuthenticated = () => {
  return useAuthStore(state => !!state.user && !!state.accessToken);
};