'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface SuperAdminNotification {
  id: string;
  type: 'NEW_REGISTRATION' | 'NEW_ORDER';
  title: string;
  message: string;
  entityId: string;
  tenantId: string;
  read: boolean;
  createdAt: string;
  tenant?: { id?: string; name: string } | null;
}

interface SuperAdminNotificationsContextValue {
  notifications: SuperAdminNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

interface NotificationsResponse {
  success: boolean;
  message?: string;
  data?: {
    notifications: SuperAdminNotification[];
    unreadCount: number;
  };
}

const SuperAdminNotificationsContext =
  createContext<SuperAdminNotificationsContextValue | undefined>(undefined);

export function SuperAdminNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [notifications, setNotifications] = useState<SuperAdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const refreshQueuedRef = useRef(false);
  const mutationInFlightRef = useRef(false);
  const dataRevisionRef = useRef(0);

  const refreshNotifications = useCallback(async () => {
    if (!isSuperAdmin) return;
    if (requestInFlightRef.current || mutationInFlightRef.current) {
      refreshQueuedRef.current = true;
      return;
    }

    do {
      refreshQueuedRef.current = false;
      requestInFlightRef.current = true;
      const requestRevision = dataRevisionRef.current;
      try {
        const response = await api.get<NotificationsResponse>(
          '/dashboard/super-admin/notifications',
          { params: { limit: 20 } },
        );
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to load notifications');
        }

        if (mountedRef.current && requestRevision === dataRevisionRef.current) {
          setNotifications(response.data.data.notifications);
          setUnreadCount(response.data.data.unreadCount);
          setError(null);
        }
      } catch (requestError) {
        if (mountedRef.current) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Failed to load notifications',
          );
        }
      } finally {
        requestInFlightRef.current = false;
        if (mountedRef.current) setLoading(false);
      }
    } while (mountedRef.current && refreshQueuedRef.current && !mutationInFlightRef.current);
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) return;

    mountedRef.current = true;
    const initialFetchTimeout = window.setTimeout(() => {
      void refreshNotifications();
    }, 0);
    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, 30_000);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(initialFetchTimeout);
      window.clearInterval(intervalId);
    };
  }, [isSuperAdmin, refreshNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!isSuperAdmin) return;
    if (mutationInFlightRef.current) {
      throw new Error('Another notification update is already in progress');
    }

    mutationInFlightRef.current = true;
    dataRevisionRef.current += 1;
    try {
      const response = await api.patch(
        `/dashboard/super-admin/notifications/${encodeURIComponent(id)}/read`,
      );
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } finally {
      mutationInFlightRef.current = false;
    }
    await refreshNotifications();
  }, [isSuperAdmin, refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!isSuperAdmin) return;
    if (mutationInFlightRef.current) {
      throw new Error('Another notification update is already in progress');
    }

    mutationInFlightRef.current = true;
    dataRevisionRef.current += 1;
    try {
      const response = await api.patch(
        '/dashboard/super-admin/notifications/mark-all-read',
      );
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to mark notifications as read');
      }
    } finally {
      mutationInFlightRef.current = false;
    }
    await refreshNotifications();
  }, [isSuperAdmin, refreshNotifications]);

  return (
    <SuperAdminNotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </SuperAdminNotificationsContext.Provider>
  );
}

export function useSuperAdminNotifications() {
  const context = useContext(SuperAdminNotificationsContext);
  if (!context) {
    throw new Error(
      'useSuperAdminNotifications must be used within SuperAdminNotificationsProvider',
    );
  }
  return context;
}
