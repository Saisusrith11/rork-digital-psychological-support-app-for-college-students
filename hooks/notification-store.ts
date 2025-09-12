import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notification } from '@/types/user';

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const saveNotifications = useCallback(async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    const updated = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    const updated = notifications.filter(notification => notification.id !== notificationId);
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  return {
    notifications,
    isLoading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
});