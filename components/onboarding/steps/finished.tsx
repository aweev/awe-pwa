// components/onboarding/steps/finished.tsx
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface Props {
  onComplete: () => void;
  isProcessing: boolean;
}

export function OnboardingFinished({ onComplete, isProcessing }: Props) {
  const t = useTranslations("OnboardingPage.finished");

  return (
    <div className="text-center">
      <Icon name="partyPopper" className="mx-auto h-16 w-16 text-green-500" />
      <h2 className="mt-6 text-2xl font-semibold">{t('title')}</h2>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      <Button
        size="lg"
        className="mt-8"
        onClick={onComplete}
        disabled={isProcessing}
      >
        {isProcessing ? t('processing') : t('button')}
      </Button>
    </div>
  );
}