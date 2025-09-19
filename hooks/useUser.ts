// hooks/useUser.ts
import useSWR from 'swr';
import apiClient from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { useIsAuthenticated } from '@/stores/authStore';
import type { User, UserPreferences } from '@prisma/client';

const USER_KEY = '/api/user/profile';

type UserDataPayload = {
  profile: User;
  preferences: UserPreferences;
};

/**
 * Fetches the current user's full profile and preferences.
 * Syncs the data with the useUserStore for global access.
 */
export function useUser() {
  const { profile, preferences, isLoading: storeIsLoading, setData } = useUserStore();
  const isAuthenticated = useIsAuthenticated();

  const { error, mutate } = useSWR(
    isAuthenticated ? USER_KEY : null,
    (url) => apiClient.get<UserDataPayload>(url),
    {
      onSuccess: (data) => {
        setData(data);
      },
      revalidateOnFocus: true,
    }
  );

  return {
    profile,
    preferences,
    isLoading: storeIsLoading && !error && !profile,
    error,
    mutate, // Expose SWR's mutate function for manual re-fetching
  };
}