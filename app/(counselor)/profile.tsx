import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { 
  Shield, 
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Globe
} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useTheme } from '@/hooks/theme-store';
import { useLanguage } from '@/hooks/language-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function CounselorProfile() {
  const { user, logout } = useAuth();
  const { colors, settings } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleLogout = useCallback(async () => {
    console.log('[CounselorProfile] Logging out');
    try {
      await logout();
      router.replace('/auth');
    } catch (e) {
      console.error('[CounselorProfile] Logout error', e);
    }
  }, [logout]);

  const go = useCallback((path: string) => {
    if (!path?.trim()) return;
    try {
      console.log('[CounselorProfile] Navigate to', path);
      router.push(path as any);
    } catch (e) {
      console.error('[CounselorProfile] Navigation error', e);
    }
  }, []);

  const profileStats = {
    totalSessions: 156,
    activeStudents: 24,
    avgRating: 4.8,
    yearsExperience: 8,
  } as const;

  const initials = (user?.fullName ?? 'SJ')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: settings.isCompactUI ? 24 : 32,
      paddingHorizontal: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text.white,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 4,
    },
    specialization: {
      fontSize: 16,
      color: colors.primary,
      marginBottom: 4,
    },
    experience: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    statsSection: {
      paddingHorizontal: 16,
      marginBottom: settings.isCompactUI ? 16 : 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: settings.isCompactUI ? 16 : 20,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
      textAlign: 'center',
    },
    languagesSection: {
      paddingHorizontal: 16,
      marginBottom: settings.isCompactUI ? 16 : 24,
    },
    languagesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    languageChip: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    languageText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    settingsSection: {
      paddingHorizontal: 16,
      marginBottom: settings.isCompactUI ? 16 : 24,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 12 : 16,
      marginBottom: 8,
    },
    settingText: {
      fontSize: 16,
      color: colors.text.primary,
      marginLeft: 12,
    },
    logoutButton: {
      backgroundColor: colors.warning,
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
      color: colors.text.white,
      fontSize: 16,
      fontWeight: '600',
    },
  }), [colors, settings.isCompactUI]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="counselor-profile-screen">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar} testID="counselor-avatar">
            <Text style={styles.avatarText}>{initials || 'SJ'}</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName ?? 'Counselor'}</Text>
          {!!user?.specialization && (
            <Text style={styles.specialization}>{user?.specialization}</Text>
          )}
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
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {profileStats.activeStudents}
              </Text>
              <Text style={styles.statLabel}>Active Students</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>
                {profileStats.avgRating}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.languagesSection}>
          <Text style={styles.sectionTitle}>{t('settings.language') || 'Languages'}</Text>
          <View style={styles.languagesList}>
            {(user?.languages ?? ['English']).map((language, index) => (
              <View key={`lang-${index}`} style={styles.languageChip}>
                <Text style={styles.languageText}>{language}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('profile.settings') || 'Settings'}</Text>
          
          <TouchableOpacity
            testID="btn-availability-settings"
            style={styles.settingItem}
            onPress={() => go('/(counselor)/settings/availability')}
          >
            <Calendar size={20} color={colors.text.secondary} />
            <Text style={styles.settingText}>Availability Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-notification-settings"
            style={styles.settingItem}
            onPress={() => go('/(counselor)/settings/notifications')}
          >
            <Bell size={20} color={colors.text.secondary} />
            <Text style={styles.settingText}>{t('settings.notifications') || 'Notification Preferences'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-language-settings"
            style={styles.settingItem}
            onPress={() => go('/(counselor)/settings/language')}
          >
            <Globe size={20} color={colors.text.secondary} />
            <Text style={styles.settingText}>{t('settings.language') || 'Language Preferences'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-privacy-settings"
            style={styles.settingItem}
            onPress={() => go('/(counselor)/settings/privacy')}
          >
            <Shield size={20} color={colors.text.secondary} />
            <Text style={styles.settingText}>{t('settings.privacy') || 'Privacy & Security'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-communications-settings"
            style={styles.settingItem}
            onPress={() => go('/(counselor)/settings/communications')}
          >
            <MessageSquare size={20} color={colors.text.secondary} />
            <Text style={styles.settingText}>{t('settings.communications') || 'Communication Settings'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-general-settings"
            style={styles.settingItem}
            onPress={() => go('/(counselor)/settings/general')}
          >
            <Settings size={20} color={colors.text.secondary} />
            <Text style={styles.settingText}>{t('settings.general') || 'General Settings'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} testID="btn-logout">
          <LogOut size={20} color={colors.text.white} />
          <Text style={styles.logoutText}>{t('profile.logout') || 'Log Out'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}