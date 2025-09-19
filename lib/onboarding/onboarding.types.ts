import type { UserOnboarding } from '@prisma/client'; 
export type { UserOnboarding };

export interface UpdateOnboardingInput { 
    userId: string; 
    currentStep?: number; 
    completedSteps?: number[];
  stepData?: Record<string, unknown>; 
  isCompleted?: boolean; 
}

export interface OnboardingStep {
  id: number;
  name: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
  data?: Record<string, unknown>;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  isCompleted: boolean;
  steps: OnboardingStep[];
}

export interface UpdateOnboardingInput {
  userId: string;
  currentStep?: number;
  completedSteps?: number[];
  stepData?: Record<string, unknown>;
  isCompleted?: boolean;
}
