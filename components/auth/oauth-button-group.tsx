// components/auth/oauth-button-group.tsx
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import apiClient from "@/lib/api";

type Provider = 'google' | 'facebook';

export function OAuthButtonGroup() {
  const t = useTranslations("RegisterPage.oauth");
  const [isLoading, setIsLoading] = useState<Provider | null>(null);

  const handleOAuthLogin = async (provider: Provider) => {
    setIsLoading(provider);
    try {
      const { url } = await apiClient.post<{ url: string }>(`/api/auth/oauth/${provider}`, {
        returnTo: window.location.pathname,
      });
      window.location.href = url;
    } catch (error) {
      console.error(`OAuth initiation for ${provider} failed`, error);
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* This button has a white background to make the multi-color Google logo look good */}
      <Button
        variant="outline" // Use outline to get a default white background in light/dark mode
        onClick={() => handleOAuthLogin('google')}
        disabled={!!isLoading}
      >
        {isLoading === 'google' ? (
          <Icon name="zap" className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          // The Icon component will now correctly render your custom SVG
          <Icon name="google" className="mr-2 h-4 w-4" />
        )}
        {t('google')}
      </Button>
      {/* This button is filled with Facebook's brand color */}
      <Button
        className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
        onClick={() => handleOAuthLogin('facebook')}
        disabled={!!isLoading}
      >
        {isLoading === 'facebook' ? (
          <Icon name="zap" className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icon name="facebook" className="mr-2 h-4 w-4" />
        )}
        {t('facebook')}
      </Button>
    </div>
  );
}