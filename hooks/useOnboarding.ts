// hooks/useOnboarding.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import apiClient from '@/lib/api';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { OnboardingProgress } from '@/lib/onboarding/onboarding.types';
import { useIsAuthenticated } from '@/stores/authStore';

const ONBOARDING_KEY = '/api/onboarding/progress';

/**
 * A comprehensive hook to manage the user onboarding flow.
 * - Fetches onboarding progress using SWR.
 * - Provides actions to update progress with optimistic UI updates.
 * - Syncs with a Zustand store for global access to onboarding state.
 */
export function useOnboarding() {
  const { progress, setProgress, isLoading: storeIsLoading } = useOnboardingStore();
  const isAuthenticated = useIsAuthenticated();

  // --- DATA FETCHING (SWR) ---
  const { error: fetchError, mutate } = useSWR(
    // Only fetch if the user is authenticated and progress isn't already loaded
    isAuthenticated ? ONBOARDING_KEY : null,
    (url) => apiClient.get<OnboardingProgress>(url),
    {
      onSuccess: (data) => {
        setProgress(data);
      },
      // You might want to disable revalidations if onboarding state is only changed via user actions
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // --- ACTIONS (SWRMutation) ---
  const { trigger: completeStep, isMutating: isCompletingStep } = useSWRMutation(
    '/api/onboarding/complete-step',
    (url, { arg }: { arg: { stepId: number; data?: Record<string, unknown> } }) => 
      apiClient.post<OnboardingProgress>(url, arg),
    {
      // Optimistic UI: Update local state immediately
      onSuccess: (newProgress) => {
        setProgress(newProgress);
        // We also revalidate the main SWR key to be sure, though setProgress often suffices
        mutate(newProgress, { revalidate: false });
      },
      // You could add error handling here to revert optimistic updates if needed
    }
  );

  return {
    progress,
    isLoading: storeIsLoading && !fetchError && !progress,
    error: fetchError,
    actions: {
      completeStep,
    },
    isCompletingStep,
  };
}