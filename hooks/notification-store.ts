import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notification } from '@/types/user';
import { safeJsonParse, safeJsonStringify } from '@/utils/safe-json-parse';

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      const parsedNotifications = safeJsonParse<Notification[]>(stored);
      if (Array.isArray(parsedNotifications)) {
        setNotifications(parsedNotifications);
      } else {
        setNotifications([]);
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
      const notificationsJson = safeJsonStringify(newNotifications);
      if (notificationsJson) {
        await AsyncStorage.setItem('notifications', notificationsJson);
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    // Check if similar notification already exists to avoid duplicates
    const existingNotification = notifications.find(n => 
      n.title === notification.title && 
      n.message === notification.message &&
      n.userId === notification.userId
    );
    
    if (existingNotification) {
      console.log('[NotificationStore] Duplicate notification prevented');
      return;
    }
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    console.log('[NotificationStore] Adding notification:', newNotification.title);
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

  return useMemo(() => ({
    notifications,
    isLoading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }), [notifications, isLoading, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification]);
});