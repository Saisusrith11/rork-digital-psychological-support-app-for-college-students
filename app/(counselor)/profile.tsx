import React, { useCallback, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  Shield, 
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Globe,
  Users,
  CheckCircle,
  XCircle,
  Mail,
  MapPin
} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useTheme } from '@/hooks/theme-store';
import { useLanguage } from '@/hooks/language-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';

export default function CounselorProfile() {
  const { user, logout } = useAuth();
  const { colors, settings } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'profile' | 'volunteers'>('profile');

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

  const { data: volunteersData, isLoading: loadingVolunteers, refetch } = trpc.volunteers.getAll.useQuery();
  const updateStatusMutation = trpc.volunteers.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Volunteer status updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to update volunteer status');
    }
  });

  const handleVerifyToggle = useCallback(async (volunteerId: string, currentStatus: boolean) => {
    await updateStatusMutation.mutateAsync({
      volunteerId,
      verified: !currentStatus
    });
  }, [updateStatusMutation]);

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
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 16,
      gap: 8,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
    },
    tabButtonActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: colors.text.white,
    },
    volunteerCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      marginHorizontal: 16,
    },
    volunteerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    volunteerName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    volunteerInfo: {
      marginBottom: 8,
    },
    volunteerDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    volunteerDetailText: {
      fontSize: 14,
      color: colors.text.secondary,
      flex: 1,
    },
    verifyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceLight,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 6,
      marginTop: 8,
    },
    verifyButtonActive: {
      backgroundColor: colors.success + '20',
    },
    verifyButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.primary,
    },
    verifyButtonTextActive: {
      color: colors.success,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusBadgeVerified: {
      backgroundColor: colors.success + '20',
    },
    statusBadgeUnverified: {
      backgroundColor: colors.warning + '20',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    statusTextVerified: {
      color: colors.success,
    },
    statusTextUnverified: {
      color: colors.warning,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.text.secondary,
      fontSize: 14,
      padding: 20,
    },
  }), [colors, settings.isCompactUI]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="counselor-profile-screen">
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'volunteers' && styles.tabButtonActive]}
          onPress={() => setActiveTab('volunteers')}
        >
          <Text style={[styles.tabText, activeTab === 'volunteers' && styles.tabTextActive]}>Volunteer Status</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' ? (
          <>
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
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginBottom: 16 }]}>Registered Volunteers</Text>
            {loadingVolunteers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : volunteersData?.volunteers && volunteersData.volunteers.length > 0 ? (
              volunteersData.volunteers.map((volunteer) => (
                <View key={volunteer.id} style={styles.volunteerCard}>
                  <View style={styles.volunteerHeader}>
                    <Text style={styles.volunteerName}>{volunteer.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      volunteer.verified ? styles.statusBadgeVerified : styles.statusBadgeUnverified
                    ]}>
                      <Text style={[
                        styles.statusText,
                        volunteer.verified ? styles.statusTextVerified : styles.statusTextUnverified
                      ]}>
                        {volunteer.verified ? 'Verified' : 'Not Verified'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.volunteerInfo}>
                    <View style={styles.volunteerDetail}>
                      <Mail size={16} color={colors.text.secondary} />
                      <Text style={styles.volunteerDetailText}>{volunteer.email}</Text>
                    </View>
                    <View style={styles.volunteerDetail}>
                      <MapPin size={16} color={colors.text.secondary} />
                      <Text style={styles.volunteerDetailText}>{volunteer.address}</Text>
                    </View>
                    {volunteer.phone && (
                      <View style={styles.volunteerDetail}>
                        <Text style={styles.volunteerDetailText}>Phone: {volunteer.phone}</Text>
                      </View>
                    )}
                    {volunteer.skills && volunteer.skills.length > 0 && (
                      <View style={styles.volunteerDetail}>
                        <Text style={styles.volunteerDetailText}>Skills: {volunteer.skills.join(', ')}</Text>
                      </View>
                    )}
                    {volunteer.availability && (
                      <View style={styles.volunteerDetail}>
                        <Text style={styles.volunteerDetailText}>Availability: {volunteer.availability}</Text>
                      </View>
                    )}
                    <View style={styles.volunteerDetail}>
                      <Text style={styles.volunteerDetailText}>
                        Registered: {new Date(volunteer.registeredAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      volunteer.verified && styles.verifyButtonActive
                    ]}
                    onPress={() => handleVerifyToggle(volunteer.id, volunteer.verified)}
                    disabled={updateStatusMutation.isLoading}
                  >
                    {volunteer.verified ? (
                      <XCircle size={16} color={colors.warning} />
                    ) : (
                      <CheckCircle size={16} color={colors.success} />
                    )}
                    <Text style={[
                      styles.verifyButtonText,
                      volunteer.verified && { color: colors.warning }
                    ]}>
                      {volunteer.verified ? 'Revoke Verification' : 'Verify Volunteer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No volunteers registered yet</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}