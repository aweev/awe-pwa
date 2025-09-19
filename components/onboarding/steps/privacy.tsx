// components/onboarding/steps/privacy.tsx
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";

// This step requires explicit consent
const privacySchema = z.object({
  dataConsent: z.boolean().refine(val => val === true, {
    message: "You must agree to the data policy to continue.", // This message will be translated by Zod
  }),
});
type PrivacyValues = z.infer<typeof privacySchema>;

interface Props {
  onComplete: (data: PrivacyValues) => void;
  isProcessing: boolean;
}

export function OnboardingPrivacy({ onComplete, isProcessing }: Props) {
  const t = useTranslations("OnboardingPage.privacy");

  const form = useForm<PrivacyValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      dataConsent: false,
    },
    mode: 'onChange', // Validate as the user interacts
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center">{t('title')}</h2>
      <p className="mt-2 text-muted-foreground text-center">{t('description')}</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="mt-8 space-y-6">
          <FormField
            control={form.control}
            name="dataConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('consentLabel')}{' '}
                    <Link href="/legal/privacy" className="font-medium text-primary hover:underline" target="_blank">
                      {t('privacyPolicyLink')}
                    </Link>.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormMessage className="text-center" />
          
          <Button type="submit" className="w-full" disabled={isProcessing || !form.formState.isValid}>
             {isProcessing ? (
                <Icon name="zap" className="mr-2 h-4 w-4 animate-spin" />
             ) : (
                t('button')
             )}
          </Button>
        </form>
      </Form>
    </div>
  );
}