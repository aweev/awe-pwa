// components/onboarding/steps/profile.tsx
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
});
type ProfileValues = z.infer<typeof profileSchema>;

interface Props {
  onComplete: (data: ProfileValues) => void;
  isProcessing: boolean;
}

export function OnboardingProfile({ onComplete, isProcessing }: Props) {
  const t = useTranslations("OnboardingPage.profile");
  const user = useAuthStore();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.user?.firstName || "",
      lastName: user.user?.lastName || "",
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center">{t('title')}</h2>
      <p className="mt-2 text-muted-foreground text-center">{t('description')}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('firstNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('lastNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isProcessing}>
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