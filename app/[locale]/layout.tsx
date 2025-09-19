// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Script from "next/script";
import { GlobalProviders } from "@/app/providers";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "de" }, { locale: "fr" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // ✅ Await params in Next.js 15
  const { locale } = await params;
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        en: `${base}/en`,
        de: `${base}/de`,
        fr: `${base}/fr`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Script id={`set-lang-${locale}`} strategy="beforeInteractive">
        {`document.documentElement.lang = '${locale}';`}
      </Script>
      <GlobalProviders>
        {children}
      </GlobalProviders>
    </NextIntlClientProvider>
  );
}