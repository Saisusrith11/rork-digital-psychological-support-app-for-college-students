import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Phone, LogOut } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertModal } from '@/components/AlertModal';

export default function AdminSettingsHome() {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = confirm('Are you sure you want to logout?');
      if (confirmed) {
        performLogout();
      }
    } else {
      setShowLogoutModal(true);
    }
  };

  const performLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Admin Settings</Text>
      
      <Link href={'/(admin)/settings/helplines'} asChild>
        <TouchableOpacity style={styles.card} testID="helplines-manage-button">
          <Phone size={20} color={Colors.primary} />
          <Text style={styles.cardText}>Helpline Management</Text>
        </TouchableOpacity>
      </Link>
      
      <TouchableOpacity style={[styles.card, styles.logoutCard]} onPress={handleLogout} testID="logout-button">
        <LogOut size={20} color={Colors.error} />
        <Text style={[styles.cardText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>

      <AlertModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        buttons={[
          {
            text: 'Cancel',
            onPress: () => setShowLogoutModal(false),
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: () => {
              setShowLogoutModal(false);
              performLogout();
            },
            style: 'destructive',
          },
        ]}
        onClose={() => setShowLogoutModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginBottom: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.surfaceLight, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardText: { fontSize: 16, color: Colors.text.primary, fontWeight: '600' },
  logoutCard: { borderColor: Colors.error, backgroundColor: Colors.surface },
  logoutText: { color: Colors.error },
});
