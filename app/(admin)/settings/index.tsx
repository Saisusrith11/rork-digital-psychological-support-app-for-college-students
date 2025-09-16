import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Phone, LogOut, Users, MessageSquare, ClipboardList, BarChart3 } from 'lucide-react-native';
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
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Admin Settings</Text>
      
      <Text style={styles.sectionTitle}>Management</Text>
      
      <Link href={'/(admin)/settings/helplines'} asChild>
        <TouchableOpacity style={styles.card} testID="helplines-manage-button">
          <Phone size={20} color={Colors.primary} />
          <Text style={styles.cardText}>Helpline Management</Text>
        </TouchableOpacity>
      </Link>
      
      <Link href={'/(admin)/students'} asChild>
        <TouchableOpacity style={styles.card} testID="students-manage-button">
          <Users size={20} color={Colors.primary} />
          <Text style={styles.cardText}>Student Management</Text>
        </TouchableOpacity>
      </Link>
      
      <Link href={'/(admin)/review-queue'} asChild>
        <TouchableOpacity style={styles.card} testID="review-queue-button">
          <ClipboardList size={20} color={Colors.primary} />
          <Text style={styles.cardText}>Review Queue</Text>
        </TouchableOpacity>
      </Link>
      
      <Link href={'/(admin)/feedback'} asChild>
        <TouchableOpacity style={styles.card} testID="feedback-button">
          <MessageSquare size={20} color={Colors.primary} />
          <Text style={styles.cardText}>User Feedback</Text>
        </TouchableOpacity>
      </Link>

      <Link href={'/(admin)/settings/student-review'} asChild>
        <TouchableOpacity style={styles.card} testID="student-review-button">
          <BarChart3 size={20} color={Colors.primary} />
          <Text style={styles.cardText}>Student Review</Text>
        </TouchableOpacity>
      </Link>
      
      <Text style={styles.sectionTitle}>Account</Text>
      
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.surfaceLight, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardText: { fontSize: 16, color: Colors.text.primary, fontWeight: '600' },
  logoutCard: { borderColor: Colors.error, backgroundColor: Colors.surface },
  logoutText: { color: Colors.error },
});
