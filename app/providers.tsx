// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/AuthProvider";
import { BrandConfigProvider, type BrandConfig } from "@/hooks/use-brand-config";
import { PWAProvider } from "@/providers/PWAProvider";
import { BrandColorsInjector } from "@/components/common/brand-colors-injector";

// Provider for things needed on EVERY single page (Theme, PWA)
export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <PWAProvider>{children}</PWAProvider>
    </ThemeProvider>
  );
}

// Providers for public-facing pages (Theme, PWA, BrandConfig)
export function PublicProviders({
  children,
  initialBrandConfig,
}: {
  children: React.ReactNode;
  initialBrandConfig?: BrandConfig;
}) {
  return (
      <BrandConfigProvider initialConfig={initialBrandConfig}>
      <BrandColorsInjector />
        {children}
      </BrandConfigProvider>
  );
}

// Providers for protected pages (Theme, PWA, BrandConfig, Auth)
export function AuthenticatedProviders({
  children,
  initialBrandConfig,
}: {
  children: React.ReactNode;
  initialBrandConfig?: BrandConfig;
}) {
  return (
    <PublicProviders initialBrandConfig={initialBrandConfig}>
      <AuthProvider>{children}</AuthProvider>
    </PublicProviders>
  );
}