import { Stack } from 'expo-router';
import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

function LogoutButton() {
  const { logout } = useAuth();

  const onPress = useCallback(async () => {
    try {
      console.log('[LogoutButton] Pressed');
      await logout();
      router.replace('/auth');
    } catch (e) {
      console.error('[LogoutButton] Error', e);
      // Fallback UI handled by header; show console message on web
      console.log('Logout failed. Please try again.');
    }
  }, [logout]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.logoutBtn}
      testID="logout-button"
      accessibilityLabel="Logout"
    >
      <LogOut size={18} color={Colors.text.white} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

export default function VolunteerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Volunteer',
        headerRight: () => (
          <View style={styles.headerRightWrap}>
            <LogoutButton />
          </View>
        ),
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Volunteer Dashboard' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRightWrap: { paddingRight: 8 },
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
