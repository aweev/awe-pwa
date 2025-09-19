// app/[locale]/(auth)/password-reset/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";
import type { z } from "zod";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

import { passwordResetRequestSchema } from "@/lib/auth/auth.schemas";
import { useAuthActions } from "@/hooks/useAuthActions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { subtleQuickFadeIn } from "@/lib/animations";

type FormValues = z.infer<typeof passwordResetRequestSchema>;

export default function PasswordResetRequestPage() {
  const t = useTranslations("PasswordResetRequestPage");
  const [isSuccess, setIsSuccess] = useState(false);
  const { requestPasswordReset, isRequestingPasswordReset } = useAuthActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
    mode: 'onChange', 
  });

  const handleSubmit = async (values: FormValues) => {
    await requestPasswordReset(values);
    // For security, always show success to prevent email enumeration.
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Icon name="mail" className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 text-heading3 text-foreground">{t("success.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("success.message")}</p>
        <Button asChild variant="ghost" className="mt-6">
          <Link href="/login">{t("success.backToLogin")}</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="text-center"
        variants={subtleQuickFadeIn}
        initial="hidden"
        animate="visible"
      >
        <Icon name="shield" className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 text-heading3 text-foreground">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <div className="mt-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      {...field}
                      disabled={isRequestingPasswordReset}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isRequestingPasswordReset}>
              {isRequestingPasswordReset ? (
                <>
                  <Spinner size={20} className="mr-2" /> 
                  {t("processingButton")}
                </>
              ) : (
                t("submitButton")
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}