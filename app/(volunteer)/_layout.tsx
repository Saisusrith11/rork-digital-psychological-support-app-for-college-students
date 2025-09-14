import { Stack } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

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

  const headerRightComponent = useMemo(() => {
    return () => (
      <View style={styles.headerRightWrap}>
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
  }, [handleLogout]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Volunteer',
        headerRight: headerRightComponent,
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
