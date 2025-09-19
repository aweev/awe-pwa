// app/[locale]/(auth)/verify/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

type VerificationStatus = 'verifying' | 'success' | 'error';

export default function VerifyPage() {
  const t = useTranslations("VerifyPage");
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError(t('error.missingToken'));
      return;
    }

    const verifyToken = async () => {
      try {
        await apiClient.post('/api/auth/verify-email', { token });
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        if (err instanceof Error) setError(err.message || t('error.default'));
      }
    };

    verifyToken();
  }, [token, t]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {status === 'verifying' && (
        <>
          <Spinner size={40} className="mx-auto" />
          <h2 className="mt-6 text-heading3 text-foreground">{t('verifying.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('verifying.message')}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <Icon name="shieldCheck" className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-heading3 text-foreground">{t('success.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('success.message')}</p>
          <Button asChild className="mt-6">
            <Link href="/login">{t('success.loginButton')}</Link>
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <Icon name="shieldOff" className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-6 text-heading3 text-foreground">{t('error.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="secondary" className="mt-6">
            <Link href="/login">{t('error.backToLogin')}</Link>
          </Button>
        </>
      )}
    </motion.div>
  );
}