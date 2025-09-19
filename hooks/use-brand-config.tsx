// hooks/use-brand-config.tsx
"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// Define the BrandConfig type
export interface BrandConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  social: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
}

// Default brand configuration
export const defaultBrandConfig: BrandConfig = {
  name: "AWE e.V.",
  colors: {
    primary: "#d95d39",
    secondary: "#2c3e50",
    accent: "#f39c12",
  },
  social: {
    twitter: "#",
    facebook: "#",
    linkedin: "#",
  },
  contact: {
    email: "info@awe-ev.org",
    phone: "+49 123 456 789",
    address: "Rosenstr 25 in 85609, Aschheim, Germany",
  },
};

interface BrandConfigContextType {
  config: BrandConfig;
  isLoading: boolean;
  error: string | null;
  updateConfig: (newConfig: Partial<BrandConfig>) => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const BrandConfigContext = createContext<BrandConfigContextType | undefined>(
  undefined
);

interface BrandConfigProviderProps {
  children: ReactNode;
  initialConfig?: BrandConfig;
}

export function BrandConfigProvider({
  children,
  initialConfig,
}: BrandConfigProviderProps) {
  const [config, setConfig] = useState<BrandConfig>(
    initialConfig || defaultBrandConfig
  );
  const [isLoading, setIsLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);

  // Fetch brand configuration from API
  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/brand-config", { cache: "no-store" });

      if (!response.ok) {
        console.warn("⚠️ API returned non-OK, using default brand config");
        setConfig(defaultBrandConfig);
        return;
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("❌ Error fetching brand config:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setConfig(defaultBrandConfig); // ✅ always fallback
    } finally {
      setIsLoading(false);
    }
  };

  // Update brand configuration
  const updateConfig = async (newConfig: Partial<BrandConfig>) => {
    try {
      setError(null);

      const updatedConfig = { ...config, ...newConfig };

      // Optimistic update
      setConfig(updatedConfig);

      // In production, this would update in Supabase
      const response = await fetch("/api/brand-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) {
        throw new Error("Failed to update brand configuration");
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("Error updating brand config:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Revert optimistic update
      await fetchConfig();
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    }
  }, [initialConfig]);

  const value: BrandConfigContextType = {
    config,
    isLoading,
    error,
    updateConfig,
    refreshConfig: fetchConfig,
  };

  return (
    <BrandConfigContext.Provider value={value}>
      {children}
    </BrandConfigContext.Provider>
  );
}

// Main hook to use brand configuration
export function useBrandConfig() {
  const context = useContext(BrandConfigContext);
  if (context === undefined) {
    throw new Error("useBrandConfig must be used within a BrandConfigProvider");
  }
  return context;
}

// Convenience hooks for specific brand properties
export function useBrandName() {
  const { config } = useBrandConfig();
  // In a real app, you might have different names per locale
  return config.name;
}

export function useBrandColors() {
  const { config } = useBrandConfig();
  return config.colors;
}

export function useBrandSocial() {
  const { config } = useBrandConfig();
  return config.social;
}

export function useBrandContact() {
  const { config } = useBrandConfig();
  return config.contact;
}

// Hook for components that need brand config but want to handle loading states
export function useBrandConfigWithFallback() {
  const context = useContext(BrandConfigContext);

  if (context === undefined) {
    // Return default config if not within provider
    return {
      config: defaultBrandConfig,
      isLoading: false,
      error: null,
      updateConfig: async () => {},
      refreshConfig: async () => {},
    };
  }

  return context;
}

// Server-side compatible version that just returns the default
export function useStaticBrandConfig() {
  return defaultBrandConfig;
}
