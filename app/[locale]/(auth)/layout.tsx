// app/[locale]/(auth)/layout.tsx
//import { getTranslations } from "next-intl/server";
import { AuthHeader } from "@/components/layout/auth/header";
import { AuthFooter } from "@/components/layout/auth/footer";
import { PublicProviders } from "@/app/providers";
import { getBrandConfig } from "@/lib/utils/brand";
import { AuthCardWrapper } from "@/components/layout/auth/wrapper";

export default async function AuthLayout({
  children,
  //params,
}: {
  children: React.ReactNode;
  //params: { locale: string }; // Direct access to locale
}) {
  const brandConfig = await getBrandConfig();
  //const t = await getTranslations({ locale: params.locale, namespace: "AuthLayout" });

  return (
    <PublicProviders initialBrandConfig={brandConfig}>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="fixed inset-0 -z-20 bg-texture-paper opacity-50 dark:opacity-20" />
      
      <div className="min-h-screen flex flex-col">
        <AuthHeader />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          {/* 
            Use the new wrapper component here. 
            Next.js knows to render this part on the client.
          */}
          <AuthCardWrapper>
            {children}
          </AuthCardWrapper>
        </main>
        <AuthFooter />
      </div>
    </PublicProviders>
  );
}