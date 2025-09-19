// lib/api.ts
import { useAuthStore } from "@/stores/authStore";
import type { AuthResponse } from "@/lib/auth/auth.types";
import { ApiClientError, type ApiErrorPayload } from "./api-errors";

type FailedRequestQueue = ((token: string | null) => void)[];

let isRefreshing = false;
let failedQueue: FailedRequestQueue = [];

const processQueue = (error: ApiClientError | null, token: string | null = null) => {
  failedQueue.forEach(callback => callback(token));
  failedQueue = [];
};

async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { accessToken, logout, setAuth } = useAuthStore.getState();

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.ok) {
    if (response.status === 204) return {} as T; // Handle No Content responses
    return response.json() as Promise<T>;
  }

  // --- Automatic Token Refresh Logic ---
  // The original request failed, likely due to an expired access token.
  if (response.status === 401 && !url.includes('/api/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include", // Essential for sending the HttpOnly cookie
        });

        if (!refreshResponse.ok) {
          const errorPayload = await refreshResponse.json() as ApiErrorPayload;
          throw new ApiClientError(refreshResponse.status, errorPayload);
        }
        
        // Explicitly type the successful refresh response
        const { user, accessToken: newAccessToken } = await refreshResponse.json() as AuthResponse;
        setAuth(user, newAccessToken);
        processQueue(null, newAccessToken);
        
        // Retry the original request with the new token
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        const retryResponse = await fetch(url, { ...options, headers });
        
        if (!retryResponse.ok) {
           const errorPayload = await retryResponse.json() as ApiErrorPayload;
           throw new ApiClientError(retryResponse.status, errorPayload);
        }
        
        return retryResponse.json() as Promise<T>;

      } catch (error) {
        processQueue(error as ApiClientError, null);
        logout(); // Force logout if refresh fails
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    } else {
      // Queue the failed request until the token is refreshed
      return new Promise<T>((resolve, reject) => {
        failedQueue.push((newAccessToken: string | null) => {
          if (newAccessToken) {
            headers.set("Authorization", `Bearer ${newAccessToken}`);
            // Retry and resolve the original promise
            resolve(apiClient<T>(url, { ...options, headers }));
          } else {
            reject(new ApiClientError(401, { error: 'Session refresh failed.' }));
          }
        });
      });
    }
  }

  // For all other errors (400, 403, 500, etc.), create and reject a typed error
  const errorPayload = await response.json() as ApiErrorPayload;
  return Promise.reject(new ApiClientError(response.status, errorPayload));
}

// Export typed helper methods
apiClient.get = <T>(url: string, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'GET' });
apiClient.post = <T>(url: string, body: unknown, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'POST', body: JSON.stringify(body), headers: { ...options?.headers, 'Content-Type': 'application/json' } });
apiClient.put = <T>(url: string, body: unknown, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body), headers: { ...options?.headers, 'Content-Type': 'application/json' } });
apiClient.delete = <T>(url: string, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'DELETE' });

export default apiClient;