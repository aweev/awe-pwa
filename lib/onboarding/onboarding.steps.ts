import type { OnboardingStep } from './onboarding.types';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    name: 'welcome',
    title: 'Welcome to AWE',
    description: 'Quick intro and consent',
    component: 'OnboardingWelcome',
    required: true,
    completed: false,
  },
  {
    id: 1,
    name: 'profile',
    title: 'Complete your profile',
    description: 'Basic personal info',
    component: 'OnboardingProfile',
    required: true,
    completed: false,
  },
  {
    id: 2,
    name: 'preferences',
    title: 'Communication preferences',
    description: 'Choose how we contact you',
    component: 'OnboardingPreferences',
    required: false,
    completed: false,
  },
  {
    id: 3,
    name: 'privacy',
    title: 'Privacy settings',
    description: 'Control your data',
    component: 'OnboardingPrivacy',
    required: true,
    completed: false,
  },
  {
    id: 4,
    name: 'finished',
    title: 'All done!',
    description: 'Tips to get started',
    component: 'OnboardingFinished',
    required: true,
    completed: false,
  },
];