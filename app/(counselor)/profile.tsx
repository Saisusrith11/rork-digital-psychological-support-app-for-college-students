import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { 
  User, 
  Shield, 
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Globe
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function CounselorProfile() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const profileStats = {
    totalSessions: 156,
    activeStudents: 24,
    avgRating: 4.8,
    yearsExperience: 8,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.split(' ').map(n => n[0]).join('') || 'SJ'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.specialization}>{user?.specialization}</Text>
          <Text style={styles.experience}>{profileStats.yearsExperience} years experience</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Professional Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileStats.totalSessions}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {profileStats.activeStudents}
              </Text>
              <Text style={styles.statLabel}>Active Students</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>
                {profileStats.avgRating}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.languagesSection}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languagesList}>
            {user?.languages?.map((language, index) => (
              <View key={index} style={styles.languageChip}>
                <Text style={styles.languageText}>{language}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Calendar size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Availability Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Bell size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Notification Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Globe size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Language Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Shield size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MessageSquare size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>Communication Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Settings size={20} color={Colors.text.secondary} />
            <Text style={styles.settingText}>General Settings</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.text.white} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  languagesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
  settingText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
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
});