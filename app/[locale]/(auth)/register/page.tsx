// app/[locale]/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";
// import { useRouter } from "next/navigation";
import type { z } from "zod";

import { signUpSchema } from "@/lib/auth/auth.schemas";
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
import { Checkbox } from "@/components/ui/checkbox";
import { slideUp, subtleQuickFadeIn } from "@/lib/animations";
import { OAuthButtonGroup } from "@/components/auth/oauth-button-group";
import { Spinner } from "@/components/ui/spinner";

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
//   const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const { signup, isSigningUp, signupError } = useAuthActions();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: 'onChange',
  });

  const handleSignUpSubmit = async (values: SignUpFormValues) => {
    try {
      await signup(values);
      setIsSuccess(true);
      // Optional: redirect after a delay
      // setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      // Error is handled by the signupError state from the hook
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
        <Icon name="mail" className="mx-auto h-12 w-12 text-green-500" />
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
        <Icon name="userCheck" className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 text-heading3 text-foreground">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("subtitle")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("loginLink")}
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

        <motion.div
            key="signup-form"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignUpSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("firstNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("firstNamePlaceholder")} {...field} disabled={isSigningUp} />
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
                      <FormLabel>{t("lastNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("lastNamePlaceholder")} {...field} disabled={isSigningUp} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("emailPlaceholder")} {...field} disabled={isSigningUp} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isSigningUp} />
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
                      <Input type="password" placeholder="••••••••" {...field} disabled={isSigningUp} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSigningUp}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        {t("termsLabel")}{' '}
                        <Link href="/legal/terms" className="underline hover:text-primary">
                          {t("termsLink")}
                        </Link>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSigningUp || !form.formState.isValid}>
                {isSigningUp ? (
                  <>
                    <Spinner size={20} className="mr-2" /> 
                    {t("processingButton")}
                  </>
                ) : (
                  t("signUpButton")
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
        
        {signupError && (
          <motion.div variants={slideUp} initial="hidden" animate="visible" className="mt-4">
              <Alert variant="destructive">
                  <Icon name="alertTriangle" className="h-4 w-4" />
                  <AlertTitle>{t("error.title")}</AlertTitle>
                  <AlertDescription>
                    {/* You can map specific error messages here for "Account already exists" etc. */}
                    {t("error.default")}
                  </AlertDescription>
              </Alert>
          </motion.div>
        )}
      </div>
    </>
  );
}