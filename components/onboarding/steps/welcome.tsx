// components/onboarding/steps/welcome.tsx
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface Props {
  onComplete: () => void;
  isProcessing: boolean;
}

export function OnboardingWelcome({ onComplete, isProcessing }: Props) {
  const t = useTranslations("OnboardingPage.welcome");

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold">{t('title')}</h2>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      <Button
        size="lg"
        className="mt-8"
        onClick={() => onComplete()}
        disabled={isProcessing}
      >
        {t('button')}
        <Icon name="arrowRight" className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}