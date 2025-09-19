// providers/AuthProvider.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/lib/api";
import type { AuthResponse } from "@/lib/auth/auth.types";
import { ApiClientError } from "@/lib/api-errors";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, logout, isInitializing, setIsInitializing } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // We now explicitly tell the apiClient what type to expect on success.
        // This makes the response fully typed.
        const { user, accessToken } = await apiClient.post<AuthResponse>(
          "/api/auth/refresh", 
          {}
        );
        setAuth(user, accessToken);
      } catch (error) {
        // The error is now a known type (ApiClientError or a network error).
        // If refresh fails, it's not a valid session.
        // We can optionally log the error for debugging.
        if (error instanceof ApiClientError) {
          // You could check error.status here if needed
          console.log("Session not found or expired. User is logged out.");
        } else {
          console.error("Auth initialization network error:", error);
        }
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    // Prevent this from running multiple times in React 18 Strict Mode's dev environment
    if (isInitializing) {
        initializeAuth();
    }

  }, [isInitializing, setAuth, logout, setIsInitializing]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        {/* Replace this with your actual app-wide loading spinner */}
        <p className="text-lg text-muted-foreground">Initializing Session...</p>
      </div>
    );
  }

  return <>{children}</>;
}