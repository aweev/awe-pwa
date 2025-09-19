// app/[locale]/(protected)/onboarding/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

import type { OnboardingProgress } from '@/lib/onboarding/onboarding.types';
import type { ONBOARDING_STEPS } from '@/lib/onboarding/onboarding.steps';

// Import all your step components
import { OnboardingWelcome } from "@/components/onboarding/steps/welcome";
import { OnboardingProfile } from "@/components/onboarding/steps/profile";
import { OnboardingPreferences } from "@/components/onboarding/steps/preferences";
import { OnboardingPrivacy } from "@/components/onboarding/steps/privacy";
import { OnboardingFinished } from "@/components/onboarding/steps/finished";

// Create a map to easily look up components
const StepComponents = {
  OnboardingWelcome,
  OnboardingProfile,
  OnboardingPreferences,
  OnboardingPrivacy,
  OnboardingFinished,
};

// Helper to calculate completion percentage
function completionPercentage(progress: OnboardingProgress): number {
    if (!progress || !progress.steps) return 0;
    const required = progress.steps.filter((s: ONBOARDING_STEPS) => s.required).length;
    if (!required) return 100;
    const done = progress.steps.filter((s: ONBOARDING_STEPS) => s.required && s.completed).length;
    return Math.round((done / required) * 100);
}


export default function OnboardingPage() {
  const t = useTranslations("OnboardingPage");
  const router = useRouter();
  const { progress, isLoading, error, actions, isCompletingStep } = useOnboarding();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icon name="zap" className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <Icon name="alertTriangle" className="h-4 w-4" />
          <AlertTitle>{t('error.title')}</AlertTitle>
          <AlertDescription>{t('error.message')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If the user is somehow on this page but has completed onboarding, send them to the dashboard.
  if (progress.isCompleted) {
      router.replace('/members/dashboard');
      return null;
  }

  const currentStep = progress.steps[progress.currentStep];
  const ComponentToRender = StepComponents[currentStep.component as keyof typeof StepComponents];

  const handleCompleteStep = async (data?: Record<string, unknown>) => {
    await actions.completeStep({ stepId: currentStep.id, data });
  };
  
  const handleFinish = () => {
    // Mark the final step as complete and then redirect
    actions.completeStep({ stepId: currentStep.id }).then(() => {
      router.push('/members/dashboard');
    });
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
            <Icon name="holistic" className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-heading3 font-bold text-foreground">
                {t('title')}
            </h1>
            <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        </div>
        
        <div className="mb-8">
            <Progress value={completionPercentage(progress)} className="w-full" />
        </div>

        <main>
          <ComponentToRender
            onComplete={currentStep.name === 'finished' ? handleFinish : handleCompleteStep}
            isProcessing={isCompletingStep}
          />
        </main>
      </div>
    </div>
  );
}