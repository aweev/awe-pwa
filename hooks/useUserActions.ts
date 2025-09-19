// hooks/useUserActions.ts
import useSWRMutation from 'swr/mutation';
import apiClient from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import type { User, UserPreferences } from '@prisma/client';
import type { PreferencesUpdateInput } from '@/lib/user/preferences.types';
import { useSWRConfig } from 'swr';

type ProfileUpdateInput = Partial<Pick<User, 'firstName' | 'lastName' | 'username'>>;

type UpdatePayload = {
  profile?: ProfileUpdateInput;
  preferences?: PreferencesUpdateInput;
};

type UserDataPayload = {
  profile: User;
  preferences: UserPreferences;
};

export function useUserActions() {
  const { updateData } = useUserStore();
  const { mutate } = useSWRConfig(); // Get SWR's global mutate function

  const { trigger: updateUser, isMutating: isUpdatingUser } = useSWRMutation(
    '/api/user/profile',
    (url, { arg }: { arg: UpdatePayload }) => apiClient.put<UserDataPayload>(url, arg),
    {
      // Optimistic UI update
      onSuccess: (newData) => {
        // Update the local store with the final data from the server
        updateData(newData);
        // Revalidate the SWR key to ensure all components using useUser get the fresh data
        mutate('/api/user/profile', newData, { revalidate: false });
      },
      // You can add an onError handler here to roll back optimistic updates if needed
    }
  );

  return {
    updateUser,
    isUpdatingUser,
  };
}