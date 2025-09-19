// lib/auth/rbac.service.ts
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { LRUCache } from 'lru-cache';

// Cache to store permissions for each role to avoid frequent DB queries.
const rolePermissionsCache = new LRUCache<Role, string[], unknown>({
  max: 100, // Max 100 roles in cache
  ttl: 1000 * 60 * 5, // Cache for 5 minutes
});

export const rbacService = {
  /**
   * Fetches all permissions associated with a given set of roles.
   * Uses a cache for high performance.
   * A special permission 'all:manage' grants all permissions.
   */
  async getPermissionsForRoles(roles: Role[]): Promise<Set<string>> {
    const allPermissions = new Set<string>();
    
    for (const role of roles) {
      if (rolePermissionsCache.has(role)) {
        rolePermissionsCache.get(role)!.forEach(p => allPermissions.add(p));
        continue;
      }

      const rolePerms = await prisma.rolePermission.findMany({
        where: { role },
        include: { permission: true },
      });
      
      const permissions = rolePerms.map(rp => `${rp.permission.resource}:${rp.permission.action}`);
      rolePermissionsCache.set(role, permissions);
      permissions.forEach(p => allPermissions.add(p));
    }

    // Grant all access if 'all:manage' permission is present
    if (allPermissions.has('all:manage')) {
      const allSystemPermissions = await prisma.permission.findMany();
      return new Set(allSystemPermissions.map(p => `${p.resource}:${p.action}`));
    }

    return allPermissions;
  },
  
  /**
   * Checks if a given set of permissions includes the required permission.
   * Supports wildcard actions (e.g., 'posts:manage' implies 'posts:create').
   */
  hasPermission(userPermissions: Set<string>, requiredPermission: string): boolean {
    if (userPermissions.has(requiredPermission)) {
      return true;
    }
    
    // Check for wildcard 'manage' permission
    const [resource, ] = requiredPermission.split(':');
    if (userPermissions.has(`${resource}:manage`)) {
      return true;
    }
    
    return false;
  },

  // --- Impersonation ---

  /**
   * SUPER ADMIN ONLY: Start impersonating another user.
   */
  async startImpersonation(adminUserId: string, targetUserId: string): Promise<void> {
    // Security Check: Ensure the person initiating is a Super Admin
    const adminUser = await prisma.user.findUnique({ where: { id: adminUserId } });
    if (!adminUser || !adminUser.roles.includes(Role.SUPER_ADMIN)) {
      throw new Error("Forbidden: Only Super Admins can impersonate users.");
    }
    
    await prisma.user.update({
      where: { id: adminUserId },
      data: { impersonatingUserId: targetUserId },
    });
  },

  /**
   * Stop impersonating and revert to the original user.
   */
  async stopImpersonation(adminUserId: string): Promise<void> {
    await prisma.user.update({
      where: { id: adminUserId },
      data: { impersonatingUserId: null },
    });
  },
};