// providers/analytics-provider.tsx
'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { useBrandConfig } from './brand-config-provider';

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  page: (name: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { config } = useBrandConfig();

  useEffect(() => {
    if (!config.features.analytics) return;

    // Initialize analytics services (Google Analytics, Plausible, etc.)
    const initAnalytics = async () => {
      // Google Analytics 4
      if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        const gtag = (window as any).gtag;
        if (gtag) {
          gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
            page_title: document.title,
            page_location: window.location.href,
          });
        }
      }

      // Plausible Analytics
      if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
        const plausible = (window as any).plausible;
        if (plausible) {
          plausible('pageview');
        }
      }
    };

    initAnalytics();
  }, [config.features.analytics]);

  useEffect(() => {
    if (isAuthenticated && user) {
      identify(user.id, {
        email: user.email,
        roles: user.roles,
        name: user.profile ? `${user.profile.first_name} ${user.profile.last_name}`.trim() : undefined,
      });
    }
  }, [isAuthenticated, user]);

  const track = (event: string, properties?: Record<string, any>) => {
    if (!config.features.analytics) return;

    // Google Analytics
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('event', event, properties);
    }

    // Plausible
    const plausible = (window as any).plausible;
    if (plausible) {
      plausible(event, { props: properties });
    }

    // Custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties }),
    }).catch(console.error);
  };

  const identify = (userId: string, traits?: Record<string, any>) => {
    if (!config.features.analytics) return;

    // Google Analytics
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId,
        custom_map: traits,
      });
    }

    // Custom analytics endpoint
    fetch('/api/analytics/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, traits }),
    }).catch(console.error);
  };

  const page = (name: string, properties?: Record<string, any>) => {
    if (!config.features.analytics) return;

    // Google Analytics
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('event', 'page_view', {
        page_title: name,
        page_location: window.location.href,
        ...properties,
      });
    }

    // Plausible
    const plausible = (window as any).plausible;
    if (plausible) {
      plausible('pageview', { props: { page: name, ...properties } });
    }
  };

  const value: AnalyticsContextType = {
    track,
    identify,
    page,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}