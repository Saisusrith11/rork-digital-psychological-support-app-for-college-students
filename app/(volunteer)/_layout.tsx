import { Stack } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { LogOut, MessageSquareMore } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import NotificationBell from '@/components/NotificationBell';

export default function VolunteerLayout() {
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      console.log('[VolunteerLayout] Logout pressed');
      await logout();
      router.replace('/auth');
    } catch (e) {
      console.error('[VolunteerLayout] Logout error', e);
    }
  }, [logout]);

  const goToChatList = useCallback(() => {
    try {
      router.push('/(volunteer)/student-chat');
    } catch (e) {
      console.error('[VolunteerLayout] Nav to chat list error', e);
    }
  }, []);

  const headerRightComponent = useMemo(() => {
    return () => (
      <View style={styles.headerRightWrap}>
        <NotificationBell />
        <TouchableOpacity
          onPress={goToChatList}
          style={styles.chatBtn}
          testID="open-student-chat"
          accessibilityLabel="Chat with Student"
        >
          <MessageSquareMore size={18} color={Colors.text.white} />
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          testID="logout-button"
          accessibilityLabel="Logout"
        >
          <LogOut size={18} color={Colors.text.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }, [handleLogout, goToChatList]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Volunteer',
        headerRight: headerRightComponent,
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Volunteer Dashboard' }} />
      <Stack.Screen name="student-chat/index" options={{ title: 'Chat with Student' }} />
      <Stack.Screen name="student-chat/[studentId]" options={{ title: 'Student Chat' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRightWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 8 },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chatText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  logoutText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },
});
