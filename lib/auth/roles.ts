// lib/auth/role.ts
import { Session  } from "@supabase/supabase-js";

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "EXECUTIVE_DIRECTOR", 
  "PROGRAM_MANAGER",
  "CONTENT_MANAGER",
  "FINANCE_MANAGER",
  "VOLUNTEER_COORDINATOR",
  "BOARD_MEMBER",
  "DATA_ANALYST"
] as const;

export const MEMBER_ROLES = [
  "VOLUNTEER",
  "MEMBER",
  "ALUMNI",
  "CORPORATE_PARTNER", 
  "MAJOR_DONOR",
  "INSTITUTIONAL_PARTNER",
  "MENTOR"
] as const;

export const ALL_ROLES = [...ADMIN_ROLES, ...MEMBER_ROLES] as const;

export type AdminRole = typeof ADMIN_ROLES[number];
export type MemberRole = typeof MEMBER_ROLES[number];
export type UserRole = AdminRole | MemberRole;

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  locale: 'en' | 'de' | 'fr';
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  organization?: string;
  position?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'de' | 'fr';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  accessibility: {
    high_contrast: boolean;
    reduced_motion: boolean;
    screen_reader: boolean;
  };
}

export interface AuthSession {
  user: User;
  session: Session; // Supabase session type
  permissions: string[];
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// Route protection types
export type RouteType = 'admin' | 'members' | 'public';
export type LocaleType = 'en' | 'de' | 'fr';

export interface RouteConfig {
  type: RouteType;
  supportedLocales: readonly LocaleType[];
  requiresAuth: boolean;
  requiredRoles?: readonly UserRole[];
}

// Notification types
export const NOTIFICATION_CHANNELS = {
  general: "General",
  community: "Community", 
  billing: "Billing",
} as const;

export type NotificationChannel = keyof typeof NOTIFICATION_CHANNELS;

export interface Notification {
  id: string;
  user_id: string;
  created_at: string;
  type: "info" | "success" | "warning" | "critical";
  channel?: NotificationChannel;
  title: string;
  message?: string;
  read: boolean;
  link_href?: string;
}

export interface NotificationPayload extends Notification {
  actions?: {
    label: string;
    onClick: () => void;
  }[];
  sound?: boolean;
}