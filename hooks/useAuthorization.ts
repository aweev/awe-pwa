// hooks/useAuthorization.ts
import { useAuthStore } from "@/stores/authStore";
import { jwtDecode } from 'jwt-decode'; // A popular library for decoding JWTs

interface DecodedAccessToken {
  permissions: string[];
  isImpersonating: boolean;
  sub: string; // The real admin's ID
  actAsSub?: string; // The user being impersonated
  // ... other JWT fields
}

/**
 * Provides authorization checks and impersonation status.
 */
export function useAuthorization() {
  const { accessToken } = useAuthStore();
  
  if (!accessToken) {
    return {
      can: () => false,
      isImpersonating: false,
      actorId: null,
      effectiveUserId: null,
    };
  }

  // Decoding is cheap, can be done on every render.
  const decoded = jwtDecode<DecodedAccessToken>(accessToken);
  const userPermissions = new Set(decoded.permissions);

  const can = (requiredPermission: string): boolean => {
    // Your RBAC service logic from the backend, replicated on the client
    if (userPermissions.has(requiredPermission)) return true;
    
    const [resource, ] = requiredPermission.split(':');
    if (userPermissions.has(`${resource}:manage`)) return true;
    
    return false;
  };

  return {
    can,
    isImpersonating: decoded.isImpersonating,
    actorId: decoded.sub,
    effectiveUserId: decoded.actAsSub || decoded.sub,
  };
}