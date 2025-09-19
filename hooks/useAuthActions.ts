// hooks/useAuthActions.ts
import useSWRMutation from 'swr/mutation';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/api';
import { 
    loginSchema, 
    mfaVerifySchema, 
    signUpSchema, 
    passwordResetRequestSchema, 
    passwordResetConfirmSchema 
} from '@/lib/auth/auth.schemas';
import type { z } from 'zod';
import type { AuthResponse } from '@/lib/auth/auth.types';

// Types for our mutations' arguments
type LoginCredentials = z.infer<typeof loginSchema>;
type MfaCredentials = z.infer<typeof mfaVerifySchema>;
type SignUpCredentials = z.infer<typeof signUpSchema>;
type PwResetRequest = z.infer<typeof passwordResetRequestSchema>;
type PwResetConfirm = z.infer<typeof passwordResetConfirmSchema>;

/**
 * A consolidated hook for all authentication actions (login, logout, signup, etc.).
 * Uses useSWRMutation for robust state handling (loading, error).
 */
export function useAuthActions() {
  const { setAuth, setMfaToken, logout } = useAuthStore();

  // --- LOGIN MUTATION ---
  const { trigger: login, isMutating: isLoggingIn, error: loginError } = useSWRMutation(
    '/api/auth/login',
    (url, { arg }: { arg: LoginCredentials }) => apiClient.post<{ mfaRequired?: boolean; mfaToken?: string } & AuthResponse>(url, arg),
    {
      onSuccess: (data) => {
        if (data.mfaRequired && data.mfaToken) {
          setMfaToken(data.mfaToken);
        } else {
          setAuth(data.user, data.accessToken);
        }
      },
    }
  );

  // --- MFA VERIFICATION MUTATION ---
  const { trigger: verifyMfa, isMutating: isVerifyingMfa, error: mfaError } = useSWRMutation(
    '/api/auth/login/verify-mfa',
    (url, { arg }: { arg: MfaCredentials }) => apiClient.post<AuthResponse>(url, arg),
    {
      onSuccess: (data) => {
        setAuth(data.user, data.accessToken);
      },
    }
  );

  // --- SIGNUP MUTATION ---
  const { trigger: signup, isMutating: isSigningUp, error: signupError } = useSWRMutation(
    '/api/auth/signup',
    (url, { arg }: { arg: SignUpCredentials }) => apiClient.post(url, arg)
  );

  // --- LOGOUT MUTATION ---
  const { trigger: doLogout, isMutating: isLoggingOut } = useSWRMutation(
    '/api/auth/logout',
    (url) => apiClient.post(url, {}),
    {
      onSuccess: () => logout(),
      onError: () => logout(), // Also logout on error
    }
  );

  // --- PASSWORD RESET REQUEST MUTATION ---
  const { trigger: requestPasswordReset, isMutating: isRequestingPasswordReset, error: requestPwResetError } = useSWRMutation(
    '/api/auth/password/request-reset',
    (url, { arg }: { arg: PwResetRequest }) => apiClient.post(url, arg)
  );

  // --- PASSWORD RESET CONFIRMATION MUTATION ---
  const { trigger: confirmPasswordReset, isMutating: isConfirmingPasswordReset, error: confirmPwResetError } = useSWRMutation(
    '/api/auth/password/reset',
    (url, { arg }: { arg: PwResetConfirm }) => apiClient.post(url, arg)
  );

  return {
    // Login
    login,
    isLoggingIn,
    loginError,
    // MFA
    verifyMfa,
    isVerifyingMfa,
    mfaError,
    // Signup
    signup,
    isSigningUp,
    signupError,
    // Logout
    logout: doLogout,
    isLoggingOut,
    // Password Reset
    requestPasswordReset,
    isRequestingPasswordReset,
    requestPwResetError,
    confirmPasswordReset,
    isConfirmingPasswordReset,
    confirmPwResetError,
  };
}