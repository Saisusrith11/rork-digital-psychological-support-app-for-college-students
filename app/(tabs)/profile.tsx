import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { 
  Calendar, 
  TrendingUp, 
  Bell, 
  Shield, 
  Globe, 
  HelpCircle, 
  MessageSquare, 
  Heart, 
  Phone, 
  LogOut 
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/auth');
  };

  const progressData = {
    daysActive: 1,
    resourcesUsed: 0,
    sessionsBooked: 0,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.split(' ').map(n => n[0]).join('') || 'TS'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Test Student'}</Text>
          <Text style={styles.userInfo}>
            {user?.college || 'Demo College'} • {user?.course || 'Computer Science'}, {user?.year || '2'} Year
          </Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{progressData.daysActive}</Text>
              <Text style={styles.progressLabel}>Days Active</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressNumber, { color: Colors.success }]}>
                {progressData.resourcesUsed}
              </Text>
              <Text style={styles.progressLabel}>Resources Used</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressNumber, { color: Colors.secondary }]}>
                {progressData.sessionsBooked}
              </Text>
              <Text style={styles.progressLabel}>Sessions Booked</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Calendar size={24} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Book Session</Text>
              <Text style={styles.actionSubtitle}>Schedule counseling</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <TrendingUp size={24} color={Colors.success} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mood Tracking</Text>
              <Text style={styles.actionSubtitle}>View insights</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Bell size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Shield size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Privacy & Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Globe size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Language</Text>
              <Text style={styles.settingValue}>English</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <HelpCircle size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MessageSquare size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Heart size={20} color={Colors.error} />
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          </View>
          
          <TouchableOpacity style={styles.emergencyContact}>
            <Phone size={16} color={Colors.error} />
            <Text style={styles.emergencyText}>Campus Counseling Center: 011-2766-7080</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emergencyContact}>
            <Phone size={16} color={Colors.error} />
            <Text style={styles.emergencyText}>National Suicide Prevention: 9152987821</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emergencyContact}>
            <Phone size={16} color={Colors.error} />
            <Text style={styles.emergencyText}>NIMHANS Helpline: 080-46110007</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.text.white} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  progressGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionContent: {
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  settingsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emergencySection: {
    backgroundColor: Colors.crisis.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.crisis.border,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.crisis.text,
    marginLeft: 8,
  },
  emergencyContact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: Colors.crisis.text,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  confirmButton: {
    backgroundColor: Colors.warning,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});