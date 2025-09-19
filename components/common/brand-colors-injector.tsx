// components/common/brand-colors-injector.tsx
"use client";

import { useBrandConfig } from "@/hooks/use-brand-config";
import { useEffect } from "react";

// This component has no visible UI. Its sole purpose is to sync the
// dynamic brand colors from our context to the global CSS variables.
export function BrandColorsInjector() {
  const { config, isLoading } = useBrandConfig();

  useEffect(() => {
    // We only want to apply colors when they are loaded and not using the default.
    // The `isLoading` flag from the hook is perfect for this.
    if (!isLoading && config && config.colors) {
      const root = document.documentElement; // This is the <html> element
      const { colors } = config;

      // Map our config names to the CSS variable names from globals.css
      // IMPORTANT: The keys here (`--color-primary`) must exactly match your CSS.
      const colorMap = {
        '--color-primary': colors.primary,
        '--color-secondary': colors.secondary,
        '--color-accent': colors.accent,
        // You can add more mappings here if needed, e.g., foreground colors
      };

      // Apply the dynamic colors
      for (const [property, value] of Object.entries(colorMap)) {
        if (value) {
          root.style.setProperty(property, value);
        }
      }
    }
  }, [config, isLoading]); // Re-run this effect whenever the config or loading state changes

  // This component renders nothing.
  return null;
}