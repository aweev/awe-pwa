import type { OnboardingStep, OnboardingProgress } from './onboarding.types';

export const DEFAULT_TOTAL_STEPS = 5;

export function buildProgress(steps: OnboardingStep[]): OnboardingProgress {
  const completedSteps = steps.filter((s) => s.completed).map((s) => s.id);
  const currentStep = Math.max(0, ...steps.map((s) => (s.completed ? 0 : s.id)).filter(Boolean));
  return { currentStep, completedSteps, totalSteps: steps.length, isCompleted: steps.every((s) => !s.required || s.completed), steps };
}

export function nextStep(steps: OnboardingStep[], from = 0): number | null {
  for (let i = from + 1; i < steps.length; i++) if (!steps[i].completed) return i;
  return null;
}

export function prevStep(steps: OnboardingStep[], from: number): number | null {
  for (let i = from - 1; i >= 0; i--) return i;
  return null;
}

export function completionPercentage(progress: OnboardingProgress): number {
  const required = progress.steps.filter((s) => s.required).length;
  if (!required) return 100;
  const done = progress.steps.filter((s) => s.required && s.completed).length;
  return Math.round((done / required) * 100);
}
