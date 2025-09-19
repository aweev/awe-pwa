// app/[locale]/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { Spinner } from "@/components/ui/spinner";

import { loginSchema, mfaVerifySchema } from "@/lib/auth/auth.schemas";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuthStore } from "@/stores/authStore";

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
import { OAuthButtonGroup } from "@/components/auth/oauth-button-group";

// Define form types from schemas
type LoginFormValues = z.infer<typeof loginSchema>;
type MfaFormValues = z.infer<typeof mfaVerifySchema>;

export default function LoginPage() {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const [showMfaStep, setShowMfaStep] = useState(false);

  // Auth hooks and state
  const { login, verifyMfa, isLoggingIn, isVerifyingMfa, loginError, mfaError } =
    useAuthActions();
  const { mfaToken } = useAuthStore();

  // --- Login Form Setup ---
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: 'onChange',
  });

  // --- MFA Form Setup ---
  const mfaForm = useForm<MfaFormValues>({
    resolver: zodResolver(mfaVerifySchema),
    defaultValues: { code: "" },
    mode: 'onChange',
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    const result = await login(values);
    if (result?.mfaRequired) {
      setShowMfaStep(true);
    } else if (result?.user) {
      if (result.onboardingCompleted) {
        router.push("/members/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  };

  const handleMfaSubmit = async (values: MfaFormValues) => {
    if (!mfaToken) return;
    const result = await verifyMfa({ ...values, mfaToken });
    if (result?.user) {
      router.push("/members/dashboard");
    }
  };

  const isProcessing = isLoggingIn || isVerifyingMfa;
  const currentError = showMfaStep ? mfaError : loginError;

  return (
    <>
      <motion.div
        className="text-center"
        variants={subtleQuickFadeIn}
        initial="hidden"
        animate="visible"
      >
        <Icon name="holistic" className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 text-heading3 text-foreground">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("subtitle")}{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t("signUpLink")}
          </Link>
        </p>
      </motion.div>

      <div className="mt-8">
        <OAuthButtonGroup />
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t("separator")}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showMfaStep ? (
            // --- Login Form ---
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("emailLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            {...field}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t("passwordLabel")}</FormLabel>
                          <Link
                            href="/password-reset"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {t("forgotPasswordLink")}
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isProcessing || !loginForm.formState.isValid}>
                    {isProcessing ? (
                      <>
                        <Spinner size={20} className="mr-2" /> 
                        {t("processingButton")}
                      </>
                    ) : (
                      t("loginButton")
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          ) : (
            // --- MFA Form ---
            <motion.div
              key="mfa-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">{t("mfa.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("mfa.subtitle")}</p>
              </div>
              <Form {...mfaForm}>
                <form
                  onSubmit={mfaForm.handleSubmit(handleMfaSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={mfaForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("mfa.codeLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123456"
                            {...field}
                            disabled={isProcessing}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isProcessing || !mfaForm.formState.isValid}>
                    {isProcessing ? (
                      <>
                        <Spinner size={20} className="mr-2" /> 
                        {t("mfa.verifyingButton")}
                      </>
                    ) : (
                      t("mfa.verifyButton")
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Universal Error Display */}
        {currentError && (
            <motion.div variants={slideUp} initial="hidden" animate="visible" className="mt-4">
                <Alert variant="destructive">
                    <Icon name="alertTriangle" className="h-4 w-4" />
                    <AlertTitle>{t("error.title")}</AlertTitle>
                    <AlertDescription>
                        {/* You can map specific error messages here if needed */}
                        {t("error.invalidCredentials")}
                    </AlertDescription>
                </Alert>
            </motion.div>
        )}
      </div>
    </>
  );
}