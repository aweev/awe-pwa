'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './auth-provider';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  link_href?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // --- Auth state (safe guard) ---
  let user: any = null;
  let isAuthenticated = false;
  let authLoading = true;

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    authLoading = auth.isLoading; // 👈 assuming AuthProvider exposes isLoading
  } catch {
    // If AuthProvider not mounted yet
    user = null;
    isAuthenticated = false;
    authLoading = true;
  }

  // --- Local state ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- Fetch + Stream Notifications ---
  useEffect(() => {
    if (authLoading) return;         // ⏳ wait until AuthProvider finished loading
    if (!isAuthenticated || !user) return; // 🚫 no need if not logged in

    let eventSource: EventSource | null = null;

    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    eventSource = new EventSource('/api/notifications/stream');

    eventSource.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      setNotifications((prev) => [notification, ...prev]);

      if (!notification.read) {
        const toastType =
          notification.type === 'error'
            ? 'error'
            : notification.type === 'success'
            ? 'success'
            : notification.type === 'warning'
            ? 'warning'
            : 'info';

        toast[toastType](notification.title, {
          description: notification.message,
          action: notification.link_href
            ? { label: 'View', onClick: () => (window.location.href = notification.link_href!) }
            : undefined,
        });
      }
    };

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [authLoading, isAuthenticated, user]);

  // --- Handlers ---
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // --- Context Value ---
  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
