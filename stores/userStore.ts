// stores/userStore.ts
import { create } from 'zustand';
import type { User, UserPreferences } from '@prisma/client';

interface UserState {
  profile: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  
  // Actions
  setData: (data: { profile: User; preferences: UserPreferences }) => void;
  updateData: (data: Partial<{ profile: Partial<User>; preferences: Partial<UserPreferences> }>) => void;
  reset: () => void;
}

const initialState = {
  profile: null,
  preferences: null,
  isLoading: true,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setData: (data) => set({ ...data, isLoading: false }),
  updateData: (data) => set(state => ({
      profile: data.profile ? { ...state.profile, ...data.profile } as User : state.profile,
      preferences: data.preferences ? { ...state.preferences, ...data.preferences } as UserPreferences : state.preferences,
  })),
  reset: () => set(initialState),
}));