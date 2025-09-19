// lib/permissions.ts
import { UserRole, AdminRole, MemberRole, ADMIN_ROLES, MEMBER_ROLES } from '@/lib/auth/roles';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // Admin roles
  SUPER_ADMIN: ['*'], // All permissions
  
  EXECUTIVE_DIRECTOR: [
    'admin.read',
    'programs.*',
    'content.read',
    'finance.read',
    'volunteers.read',
    'events.read',
    'communications.read',
    'analytics.read',
    'users.read',
  ],
  
  PROGRAM_MANAGER: [
    'admin.read',
    'programs.read',
    'programs.update',
    'programs.participants.*',
    'events.read',
    'events.create',
    'communications.read',
    'analytics.read',
  ],
  
  CONTENT_MANAGER: [
    'admin.read',
    'content.*',
    'communications.*',
    'analytics.read',
  ],
  
  FINANCE_MANAGER: [
    'admin.read',
    'finance.*',
    'analytics.finance.*',
  ],
  
  VOLUNTEER_COORDINATOR: [
    'admin.read',
    'volunteers.*',
    'events.read',
    'events.create',
    'communications.volunteers.*',
  ],
  
  BOARD_MEMBER: [
    'admin.read',
    'analytics.read',
    'finance.read',
    'programs.read',
  ],
  
  DATA_ANALYST: [
    'admin.read',
    'analytics.*',
    'programs.read',
    'finance.read',
  ],

  // Member roles
  VOLUNTEER: [
    'member.read',
    'member.community.read',
    'member.resources.read',
    'member.events.read',
    'member.profile.*',
  ],
  
  MEMBER: [
    'member.read',
    'member.community.read',
    'member.resources.read',
    'member.events.read',
    'member.profile.*',
  ],
  
  ALUMNI: [
    'member.*',
    'member.mentorship.*',
    'member.giving.*',
  ],
  
  CORPORATE_PARTNER: [
    'member.read',
    'member.partnership.*',
    'member.reports.*',
    'member.collaboration.*',
  ],
  
  MAJOR_DONOR: [
    'member.read',
    'member.impact.*',
    'member.exclusive.*',
    'member.giving.*',
  ],
  
  INSTITUTIONAL_PARTNER: [
    'member.read',
    'member.collaboration.*',
    'member.reports.*',
    'member.partnerships.*',
  ],
  
  MENTOR: [
    'member.read',
    'member.mentorship.*',
    'member.participants.read',
    'member.resources.mentors.*',
  ],
};

/**
 * Check if user has permission based on their roles
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermissions: string | string[]
): boolean {
  if (userPermissions.includes('*')) return true;
  
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  return required.every(reqPerm => {
    return userPermissions.some(userPerm => {
      if (userPerm === reqPerm) return true;
      if (userPerm.endsWith('.*')) {
        const baseResource = userPerm.slice(0, -2);
        return reqPerm.startsWith(baseResource);
      }
      return false;
    });
  });
}

/**
 * Get all permissions for user roles
 */
export function getUserPermissions(roles: UserRole[]): string[] {
  const allPermissions = new Set<string>();
  
  roles.forEach(role => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    permissions.forEach(perm => allPermissions.add(perm));
  });
  
  return Array.from(allPermissions);
}

/**
 * Check if user is admin (has any admin role)
 */
export function isAdmin(roles: UserRole[]): boolean {
  return roles.some(role => ADMIN_ROLES.includes(role as AdminRole));
}

/**
 * Check if user is member (has any member role)
 */
export function isMember(roles: UserRole[]): boolean {
  return roles.some(role => MEMBER_ROLES.includes(role as MemberRole));
}

/**
 * Get highest priority role for display
 */
export function getPrimaryRole(roles: UserRole[]): UserRole {
  // Priority order: Super Admin > Executive Director > other admin roles > member roles
  const priority: UserRole[] = [
    'SUPER_ADMIN',
    'EXECUTIVE_DIRECTOR',
    'PROGRAM_MANAGER',
    'CONTENT_MANAGER',
    'FINANCE_MANAGER',
    'VOLUNTEER_COORDINATOR',
    'BOARD_MEMBER',
    'DATA_ANALYST',
    'ALUMNI',
    'MENTOR',
    'MAJOR_DONOR',
    'CORPORATE_PARTNER',
    'INSTITUTIONAL_PARTNER',
    'VOLUNTEER',
    'MEMBER',
  ];
  
  for (const role of priority) {
    if (roles.includes(role)) return role;
  }
  
  return roles[0] || 'MEMBER';
}

/**
 * Role hierarchy utilities
 */
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 10,
  EXECUTIVE_DIRECTOR: 9,
  PROGRAM_MANAGER: 8,
  CONTENT_MANAGER: 7,
  FINANCE_MANAGER: 7,
  VOLUNTEER_COORDINATOR: 7,
  DATA_ANALYST: 6,
  BOARD_MEMBER: 5,
  ALUMNI: 4,
  MENTOR: 3,
  MAJOR_DONOR: 3,
  CORPORATE_PARTNER: 3,
  INSTITUTIONAL_PARTNER: 3,
  VOLUNTEER: 2,
  MEMBER: 1,
} as const;

export function hasHigherRole(userRoles: UserRole[], targetRole: UserRole): boolean {
  const userLevel = Math.max(...userRoles.map(role => ROLE_HIERARCHY[role] || 0));
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  return userLevel > targetLevel;
}