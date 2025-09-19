// components/onboarding/steps/preferences.tsx
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";

// This schema defines the data we'll collect in this step
const preferencesSchema = z.object({
  newsletter: z.boolean().default(true),
  projectUpdates: z.boolean().default(true),
  eventInvitations: z.boolean().default(false),
});
type PreferencesValues = z.infer<typeof preferencesSchema>;

interface Props {
  onComplete: (data: PreferencesValues) => void;
  isProcessing: boolean;
}

export function OnboardingPreferences({ onComplete, isProcessing }: Props) {
  const t = useTranslations("OnboardingPage.preferences");

  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    // Set smart defaults: Newsletter and project updates are likely important
    defaultValues: {
      newsletter: true,
      projectUpdates: true,
      eventInvitations: false,
    },
  });

  // A helper array to easily render the checkboxes
  const items = [
    { id: "newsletter" as const, label: t('newsletterLabel'), description: t('newsletterDescription') },
    { id: "projectUpdates" as const, label: t('projectUpdatesLabel'), description: t('projectUpdatesDescription') },
    { id: "eventInvitations" as const, label: t('eventInvitationsLabel'), description: t('eventInvitationsDescription') },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center">{t('title')}</h2>
      <p className="mt-2 text-muted-foreground text-center">{t('description')}</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md border p-4">
            {items.map((item) => (
              <FormField
                key={item.id}
                control={form.control}
                name={item.id}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{item.label}</FormLabel>
                      <FormDescription>{item.description}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
             {/* This step is not required, so we provide a skip button */}
             <Button type="button" variant="ghost" onClick={() => onComplete(form.getValues())} disabled={isProcessing}>
                {t('skipButton')}
             </Button>
             <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                   <Icon name="zap" className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                   t('button')
                )}
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}