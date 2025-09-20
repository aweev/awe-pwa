// hooks/useAuthActions.ts

import useSWRMutation from 'swr/mutation';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/api'; // Your pre-configured axios/fetch client
import type { z } from 'zod';
import type { 
    loginSchema, 
    mfaVerifySchema, 
    signUpSchema, 
    passwordResetRequestSchema, 
    passwordResetConfirmSchema 
} from '@/lib/auth/auth.schemas';
import type { AuthResponse } from '@/lib/auth/auth.types';

// Define argument types from your Zod schemas for type safety
type LoginCredentials = z.infer<typeof loginSchema>;
type MfaCredentials = z.infer<typeof mfaVerifySchema>;
type SignUpCredentials = z.infer<typeof signUpSchema>;
type PwResetRequestCredentials = z.infer<typeof passwordResetRequestSchema>;
type PwResetConfirmCredentials = z.infer<typeof passwordResetConfirmSchema>;

// The potential response from the initial login step
type LoginResponse = AuthResponse & { mfaRequired?: boolean; mfaToken?: string };

/**
 * A consolidated hook for all authentication actions (login, logout, signup, etc.).
 * It abstracts API calls, manages loading/error states, and syncs with the global auth store.
 * This hook should be used by UI components to trigger authentication flows.
 */
export function useAuthActions() {
  const { setAuth, setMfaToken, logout: clearClientState } = useAuthStore();

  // --- LOGIN MUTATION ---
  const { 
    trigger: login, 
    isMutating: isLoggingIn, 
    error: loginError 
  } = useSWRMutation(
    '/api/auth/login',
    (url, { arg }: { arg: LoginCredentials }) => apiClient.post<LoginResponse>(url, arg),
    {
      onSuccess: (data) => {
        if (data.mfaRequired && data.mfaToken) {
          // If MFA is needed, we only store the temporary MFA token
          setMfaToken(data.mfaToken);
        } else if (data.user && data.accessToken) {
          // On successful password login, update the global auth state
          setAuth(data.user, data.accessToken);
        }
      },
    }
  );

  // --- MFA VERIFICATION MUTATION ---
  const { 
    trigger: verifyMfa, 
    isMutating: isVerifyingMfa, 
    error: mfaError 
  } = useSWRMutation(
    '/api/auth/login/verify-mfa',
    (url, { arg }: { arg: MfaCredentials }) => apiClient.post<AuthResponse>(url, arg),
    {
      onSuccess: (data) => {
        // On successful MFA verification, the user is fully logged in
        setAuth(data.user, data.accessToken);
      },
    }
  );

  // --- SIGNUP MUTATION ---
  const { 
    trigger: signup, 
    isMutating: isSigningUp, 
    error: signupError 
  } = useSWRMutation(
    '/api/auth/signup',
    (url, { arg }: { arg: SignUpCredentials }) => apiClient.post<{ message: string }>(url, arg)
  );

  // --- LOGOUT MUTATION ---
  const { 
    trigger: doLogout, 
    isMutating: isLoggingOut 
  } = useSWRMutation(
    '/api/auth/logout',
    (url) => apiClient.post(url, {}),
    {
      onSuccess: () => {
        // Always clear client state on successful server logout
        clearClientState();
      },
      onError: (err) => {
        console.error("Logout failed, but clearing client state anyway:", err);
        // CRITICAL: Clear client state even if the API call fails.
        // This prevents the user from being stuck in a "logged in" visual state.
        clearClientState();
      },
    }
  );

  // --- PASSWORD RESET REQUEST MUTATION ---
  const { 
    trigger: requestPasswordReset, 
    isMutating: isRequestingPasswordReset, 
    error: requestPwResetError 
  } = useSWRMutation(
    '/api/auth/password/request-reset', // Corrected from your file list
    (url, { arg }: { arg: PwResetRequestCredentials }) => apiClient.post(url, arg)
  );

  // --- PASSWORD RESET CONFIRMATION MUTATION ---
  const { 
    trigger: confirmPasswordReset, 
    isMutating: isConfirmingPasswordReset, 
    error: confirmPwResetError 
  } = useSWRMutation(
    '/api/auth/password/reset', // Corrected from your file list
    (url, { arg }: { arg: PwResetConfirmCredentials }) => apiClient.post(url, arg)
  );

  return {
    // Actions
    login,
    verifyMfa,
    signup,
    logout: doLogout,
    requestPasswordReset,
    confirmPasswordReset,
    
    // States and Errors
    isLoggingIn,
    loginError,
    isVerifyingMfa,
    mfaError,
    isSigningUp,
    signupError,
    isLoggingOut,
    isRequestingPasswordReset,
    requestPwResetError,
    isConfirmingPasswordReset,
    confirmPwResetError,
  };
}