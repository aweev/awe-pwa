// app/[locale]/(auth)/password-reset/[token]/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import type { z } from "zod";

import { passwordResetConfirmSchema } from "@/lib/auth/auth.schemas";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { slideUp, subtleQuickFadeIn } from "@/lib/animations";
import { Spinner } from "@/components/ui/spinner";

type FormValues = z.infer<typeof passwordResetConfirmSchema>;

// The page component receives params from the dynamic route segment
export default function PasswordResetConfirmPage({ params }: { params: { token: string } }) {
  const t = useTranslations("PasswordResetConfirmPage");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { confirmPasswordReset, isConfirmingPasswordReset, confirmPwResetError } =
    useAuthActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: 'onChange',
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await confirmPasswordReset({
        token: params.token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the hook's state
      console.error(error);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Icon name="shieldCheck" className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-6 text-heading3 text-foreground">{t("success.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("success.message")}</p>
        <Button asChild className="mt-6">
          <Link href="/login">{t("success.loginButton")}</Link>
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
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("passwordLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isConfirmingPasswordReset}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isConfirmingPasswordReset}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isConfirmingPasswordReset}>
              {isConfirmingPasswordReset ? (
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

        {confirmPwResetError && (
          <motion.div variants={slideUp} initial="hidden" animate="visible" className="mt-4">
            <Alert variant="destructive">
              <Icon name="alertTriangle" className="h-4 w-4" />
              <AlertTitle>{t("error.title")}</AlertTitle>
              <AlertDescription>{t("error.invalidToken")}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </>
  );
}