import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useNotifications } from '@/hooks/notification-store';
import { useAuth } from '@/hooks/auth-store';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/hooks/language-store';

interface NotificationBellProps {
  onOpenCenter?: () => void;
}

const NotificationBellComponent: React.FC<NotificationBellProps> = ({ onOpenCenter }) => {
  const { unreadCount, addNotification } = useNotifications();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [hasNew, setHasNew] = useState<boolean>(false);

  const startPulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: false }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: false })
    ]).start();
  }, [pulseAnim]);

  const conversationsQuery = trpc.chat.getActiveConversations.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (conversationsQuery.data && !conversationsQuery.isError) {
      try {
        const list = conversationsQuery.data?.conversations ?? [];
        list.forEach((conv) => {
          const last = conv.lastMessage;
          if (last && last.recipientId === (user?.id ?? '') && !last.isRead) {
            setHasNew(true);
            startPulse();
            addNotification({
              userId: user?.id ?? 'unknown',
              title: 'New message',
              message: `${last.senderName ?? 'Someone'} sent you a message`,
              type: 'message',
              isRead: false,
              data: { conversationId: last.conversationId },
            });
          }
        });
      } catch (e) {
        console.log('[NotificationBell] poll data processing error', e);
      }
    }
    
    if (conversationsQuery.isError) {
      console.log('[NotificationBell] poll error', conversationsQuery.error);
    }
  }, [conversationsQuery.data, conversationsQuery.isError, conversationsQuery.error, user?.id, startPulse, addNotification]);

  useEffect(() => {
    if (unreadCount === 0) {
      setHasNew(false);
    }
  }, [unreadCount]);

  const scale = useMemo(() => pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }), [pulseAnim]);
  const tint = useMemo(() => (hasNew ? Colors.accent : Colors.text.primary), [hasNew]);

  const handlePress = useCallback(() => {
    onOpenCenter?.();
  }, [onOpenCenter]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }], [isRTL ? 'left' : 'right']: 16 as number }]}> 
      <TouchableOpacity accessibilityRole="button" testID="notification-bell" onPress={handlePress} activeOpacity={0.8} style={styles.button}>
        <Bell size={22} color={tint} />
        {unreadCount > 0 && (
          <View style={styles.badge} testID="notification-badge">
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

NotificationBellComponent.displayName = 'NotificationBell';

export const NotificationBell = React.memo(NotificationBellComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 12 : 8,
    zIndex: 1000,
    pointerEvents: 'box-none' as const,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700' as const,
  },
});

export default NotificationBell;
