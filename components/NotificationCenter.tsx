import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, FlatList } from 'react-native';
import { CheckCheck, Trash2, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useNotifications } from '@/hooks/notification-store';
import type { Notification } from '@/types/user';
import { useLanguage } from '@/hooks/language-store';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = React.memo(({ visible, onClose }) => {
  const { notifications, markAllAsRead, markAsRead, deleteNotification } = useNotifications();
  const { isRTL, t } = useLanguage();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -200, duration: 180, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 160, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, translateY, opacity]);

  const handleMarkAll = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const renderItem = useCallback(({ item }: { item: Notification }) => {
    const accent = item.type === 'message' ? Colors.primary : item.type === 'booking' ? Colors.secondary : item.type === 'feedback' ? Colors.success : Colors.accent;
    return (
      <TouchableOpacity
        style={styles.notificationItem}
        activeOpacity={0.8}
        onPress={() => {
          if (!item.isRead) markAsRead(item.id);
        }}
        testID={`notification-item-${item.id}`}
      >
        <View style={[styles.iconDot, { backgroundColor: accent }]} />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notificationTime}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {!item.isRead && (
          <View style={styles.unreadBadge} />
        )}
        <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteButton} accessibilityRole="button">
          <Trash2 size={16} color={Colors.text.light} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [markAsRead, deleteNotification]);

  if (!mounted && !visible) return null;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.overlay, { opacity }]}
      testID="notification-center-overlay"
    >
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[styles.panel, { transform: [{ translateY }], [isRTL ? 'left' : 'right']: 12 as number }]}
        testID="notification-center"
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{t('profile.notifications')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleMarkAll} style={styles.headerBtn} accessibilityRole="button" testID="mark-all-read">
              <CheckCheck size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn} accessibilityRole="button" testID="close-center">
              <X size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContainer}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('common.success')}</Text>}
        />
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  backdrop: {
    ...Platform.select({ web: { cursor: 'default' }, default: {} }),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 56 : 52,
    width: 320,
    maxHeight: 480,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceLight,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F6F8FA',
  },
  list: {
    maxHeight: 420,
  },
  listContainer: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  notificationMessage: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 11,
    color: Colors.text.light,
    marginTop: 4,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginHorizontal: 8,
  },
  deleteButton: {
    padding: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceLight,
  },
  emptyText: {
    padding: 16,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
});

export default NotificationCenter;
