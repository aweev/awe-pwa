// providers/app-providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth-provider';
import { NotificationProvider } from './notification-provider';
import { BrandConfigProvider } from './brand-config-provider';
import { PWAProvider } from './pwa-provider';
import { AnalyticsProvider } from './analytics-provider';
import { useState } from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <BrandConfigProvider>
          <AuthProvider>
            <NotificationProvider>
              <AnalyticsProvider>
                <PWAProvider
                  appName="AWE e.V."
                  appDescription="Transforming cycles of poverty and displacement into pathways of dignity and prosperity."
                >
                  {children}
                  <Toaster richColors position="top-right" />
                </PWAProvider>
              </AnalyticsProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrandConfigProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}