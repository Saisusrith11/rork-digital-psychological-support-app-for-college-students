import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Switch, TextInput, Alert } from 'react-native';
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
  LogOut,
  ChevronRight,
  User,
  Send,

  WifiOff
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useNotifications } from '@/hooks/notification-store';
import { useFeedback } from '@/hooks/feedback-store';
import { useLanguage, type SupportedLanguage } from '@/hooks/language-store';
import { useMood } from '@/hooks/mood-store';
import MoodSelector from '@/components/MoodSelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';


export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { submitFeedback } = useFeedback();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { todaysMood, addMoodEntry, realAnalytics, reloadRealAnalytics, setUserId } = useMood();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUsernameSettings, setShowUsernameSettings] = useState(user?.showUsername ?? true);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feature' | 'general' | 'complaint'>('general');
  const [isOffline, setIsOffline] = useState(false);
  const [offlineData, setOfflineData] = useState<any>(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Check offline status and load offline data
  useEffect(() => {
    // Simulate network check (in real app, use NetInfo)
    const checkConnection = () => {
      // For demo purposes, assume we're online
      setIsOffline(false);
    };
    
    checkConnection();
  }, []);

  // Initialize mood tracking for current user
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id, setUserId]);

  const handleMoodSubmit = async (mood: 'great' | 'good' | 'okay' | 'low' | 'hard', notes?: string) => {
    await addMoodEntry(mood, notes);
    setShowMoodModal(false);
  };

  const handleViewAnalytics = async (range: '7d' | '30d' | '90d') => {
    setAnalyticsRange(range);
    await reloadRealAnalytics(range);
    setShowAnalyticsModal(true);
  };

  // Save data offline when changes are made
  const saveOfflineData = async (data: any) => {
    try {
      // Store offline data in memory for demo
      setOfflineData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'hi', name: 'Hindi' }
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/auth');
  };

  const handleLanguageSelect = (languageCode: string, languageName: string) => {
    setLanguage(languageCode as SupportedLanguage);
    setShowLanguageModal(false);
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      if (isOffline) {
        // Store feedback offline
        const offlineFeedback = {
          userId: user?.id || 'anonymous',
          userName: user?.showUsername ? user.fullName : 'Anonymous User',
          message: feedbackText.trim(),
          category: feedbackCategory,
          timestamp: new Date().toISOString(),
          status: 'pending_sync'
        };
        
        saveOfflineData({ ...offlineData, pendingFeedback: [...(offlineData?.pendingFeedback || []), offlineFeedback] });
        Alert.alert('Feedback Saved', 'Your feedback has been saved offline and will be sent when you reconnect.');
      } else {
        submitFeedback({
          userId: user?.id || 'anonymous',
          userName: user?.showUsername ? user.fullName : 'Anonymous User',
          message: feedbackText.trim(),
          category: feedbackCategory,
        });
      }
      setFeedbackText('');
      setShowFeedbackModal(false);
    }
  };

  const emergencyContacts = [
    { name: 'Campus Counseling Center', number: '011-2766-7080' },
    { name: 'National Suicide Prevention', number: '9152987821' },
    { name: 'NIMHANS Helpline', number: '080-46110007' },
    { name: 'Vandrevala Foundation', number: '9999666555' },
    { name: 'iCall Psychosocial Helpline', number: '9152987821' },
  ];

  const progressData = {
    daysActive: 1,
    resourcesUsed: 0,
    sessionsBooked: 0,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <WifiOff size={16} color={Colors.warning} />
              <Text style={styles.offlineText}>Offline Mode</Text>
            </View>
          )}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.fullName || offlineData?.fullName)?.split(' ').map((n: string) => n[0]).join('') || 'TS'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || offlineData?.fullName || 'Test Student'}</Text>
          <Text style={styles.userInfo}>
            {user?.college || offlineData?.college || 'Demo College'} • {user?.course || offlineData?.course || 'Computer Science'}, {user?.year || offlineData?.year || '2'} Year
          </Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>{t('profile.progress')}</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{progressData.daysActive}</Text>
              <Text style={styles.progressLabel}>{t('profile.daysActive')}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressNumber, { color: Colors.success }]}>
                {progressData.resourcesUsed}
              </Text>
              <Text style={styles.progressLabel}>{t('profile.resourcesUsed')}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressNumber, { color: Colors.secondary }]}>
                {progressData.sessionsBooked}
              </Text>
              <Text style={styles.progressLabel}>{t('profile.sessionsBooked')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodCard}>
            {todaysMood ? (
              <View style={styles.todayMoodContainer}>
                <View style={styles.moodDisplay}>
                  <Text style={styles.moodEmoji}>
                    {todaysMood.mood === 'great' ? '😊' : 
                     todaysMood.mood === 'good' ? '🙂' : 
                     todaysMood.mood === 'okay' ? '😐' : 
                     todaysMood.mood === 'low' ? '😔' : '😢'}
                  </Text>
                  <Text style={styles.moodLabel}>
                    {todaysMood.mood.charAt(0).toUpperCase() + todaysMood.mood.slice(1)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.updateMoodButton}
                  onPress={() => setShowMoodModal(true)}
                >
                  <Text style={styles.updateMoodText}>Update</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addMoodButton}
                onPress={() => setShowMoodModal(true)}
              >
                <Heart size={24} color={Colors.primary} />
                <Text style={styles.addMoodText}>Track your mood</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {realAnalytics && (
            <View style={styles.analyticsPreview}>
              <Text style={styles.analyticsTitle}>Your Analytics ({analyticsRange})</Text>
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsNumber}>{realAnalytics.totalEntries}</Text>
                  <Text style={styles.analyticsLabel}>Entries</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={[styles.analyticsNumber, { color: Colors.success }]}>
                    {realAnalytics.averageMood.toFixed(1)}
                  </Text>
                  <Text style={styles.analyticsLabel}>Avg Mood</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={[styles.analyticsNumber, { 
                    color: realAnalytics.moodTrend === 'improving' ? Colors.success : 
                           realAnalytics.moodTrend === 'declining' ? Colors.warning : Colors.primary 
                  }]}>
                    {realAnalytics.moodTrend === 'improving' ? '↗️' : 
                     realAnalytics.moodTrend === 'declining' ? '↘️' : '→'}
                  </Text>
                  <Text style={styles.analyticsLabel}>Trend</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.viewAnalyticsButton}
                onPress={() => handleViewAnalytics(analyticsRange)}
              >
                <TrendingUp size={16} color={Colors.primary} />
                <Text style={styles.viewAnalyticsText}>View Detailed Analytics</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/booking')}
          >
            <Calendar size={24} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{t('profile.bookSession')}</Text>
              <Text style={styles.actionSubtitle}>{t('profile.scheduleCounseling')}</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <MessageSquare size={24} color={Colors.secondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>AI Chat Support</Text>
              <Text style={styles.actionSubtitle}>24/7 mental health assistance</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowNotificationsModal(true)}
          >
            <Bell size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t('profile.notifications')}</Text>
              <View style={styles.settingValueContainer}>
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                  </View>
                )}
                <ChevronRight size={16} color={Colors.text.secondary} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowPrivacyModal(true)}
          >
            <Shield size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t('profile.privacyData')}</Text>
              <ChevronRight size={16} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <Globe size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t('profile.language')}</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValue}>
                  {languages.find(l => l.code === currentLanguage)?.name || 'English'}
                </Text>
                <ChevronRight size={16} color={Colors.text.secondary} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowHelpModal(true)}
          >
            <HelpCircle size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t('profile.helpSupport')}</Text>
              <ChevronRight size={16} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowFeedbackModal(true)}
          >
            <MessageSquare size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t('profile.sendFeedback')}</Text>
              <ChevronRight size={16} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <User size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{t('profile.showUsername')}</Text>
              <Switch
                value={showUsernameSettings}
                onValueChange={setShowUsernameSettings}
                trackColor={{ false: Colors.surfaceLight, true: Colors.primary + '40' }}
                thumbColor={showUsernameSettings ? Colors.primary : Colors.text.light}
              />
            </View>
          </View>
        </View>

        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Heart size={20} color={Colors.error} />
            <Text style={styles.emergencyTitle}>{t('profile.emergency')}</Text>
          </View>
          
          {emergencyContacts.map((contact) => (
            <TouchableOpacity key={contact.name} style={styles.emergencyContact}>
              <Phone size={16} color={Colors.error} />
              <Text style={styles.emergencyText}>{contact.name}: {contact.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.text.white} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
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

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageSelect(language.code, language.name)}
              >
                <Text style={[
                  styles.languageOptionText,
                  currentLanguage === language.code && styles.selectedLanguageOptionText
                ]}>
                  {language.name}
                </Text>
                {currentLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.closeLanguageModal}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.closeLanguageModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationsModalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <ScrollView style={styles.notificationsList}>
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <View key={notification.id} style={styles.notificationItem}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyNotifications}>
                  <Bell size={48} color={Colors.text.light} />
                  <Text style={styles.emptyNotificationsText}>No notifications</Text>
                </View>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowNotificationsModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.privacyModalContent}>
            <Text style={styles.modalTitle}>Privacy & Data</Text>
            <ScrollView style={styles.privacyContent}>
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Data Collection</Text>
                <Text style={styles.privacyText}>
                  We collect minimal data necessary for app functionality including mood entries, 
                  assessment responses, and usage analytics. All data is stored locally on your device.
                </Text>
              </View>
              
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Data Sharing</Text>
                <Text style={styles.privacyText}>
                  Your personal data is never shared with third parties. Assessment results are only 
                  shared with counselors if you explicitly provide consent.
                </Text>
              </View>
              
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Data Security</Text>
                <Text style={styles.privacyText}>
                  All conversations and personal information are encrypted and stored securely. 
                  We follow industry-standard security practices.
                </Text>
              </View>
              
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Your Rights</Text>
                <Text style={styles.privacyText}>
                  You can request data deletion, modify your information, or withdraw consent at any time. 
                  Contact support for assistance.
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModalContent}>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            
            <View style={styles.categorySelector}>
              <Text style={styles.categoryLabel}>Category:</Text>
              <View style={styles.categoryButtons}>
                {(['general', 'bug', 'feature', 'complaint'] as const).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      feedbackCategory === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setFeedbackCategory(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      feedbackCategory === category && styles.selectedCategoryButtonText
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.feedbackInput}
              placeholder="Share your thoughts, report bugs, or suggest improvements..."
              placeholderTextColor={Colors.text.light}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.sendFeedbackButton]} 
                onPress={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
              >
                <Send size={16} color={Colors.text.white} />
                <Text style={styles.sendFeedbackButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpModalContent}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <ScrollView style={styles.helpContent}>
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Getting Started</Text>
                <Text style={styles.helpText}>
                  • Complete the mental health assessment to get personalized recommendations{"\n"}
                  • Explore resources for stress management and wellness{"\n"}
                  • Book confidential counseling sessions when needed
                </Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Emergency Support</Text>
                <Text style={styles.helpText}>
                  If you&apos;re experiencing a mental health crisis, please contact emergency services 
                  or use the helpline numbers provided in the Emergency Contacts section.
                </Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Privacy & Confidentiality</Text>
                <Text style={styles.helpText}>
                  All your conversations and data are kept confidential. You control what information 
                  is shared with counselors through explicit consent.
                </Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Technical Support</Text>
                <Text style={styles.helpText}>
                  For technical issues, use the feedback feature to report bugs or contact 
                  our support team through the app.
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mood Entry Modal */}
      <Modal
        visible={showMoodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.moodModalContent}>
            <Text style={styles.modalTitle}>How are you feeling today?</Text>
            <MoodSelector
              onMoodSelect={handleMoodSubmit}
            />
          </View>
        </View>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        visible={showAnalyticsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAnalyticsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.analyticsModalContent}>
            <Text style={styles.modalTitle}>Mood Analytics ({analyticsRange})</Text>
            <ScrollView style={styles.analyticsContent}>
              {realAnalytics && (
                <>
                  <View style={styles.analyticsSection}>
                    <Text style={styles.analyticsSectionTitle}>Overview</Text>
                    <View style={styles.analyticsOverview}>
                      <View style={styles.overviewItem}>
                        <Text style={styles.overviewNumber}>{realAnalytics.totalEntries}</Text>
                        <Text style={styles.overviewLabel}>Total Entries</Text>
                      </View>
                      <View style={styles.overviewItem}>
                        <Text style={[styles.overviewNumber, { color: Colors.success }]}>
                          {realAnalytics.averageMood.toFixed(1)}/5
                        </Text>
                        <Text style={styles.overviewLabel}>Average Mood</Text>
                      </View>
                      <View style={styles.overviewItem}>
                        <Text style={[styles.overviewNumber, { 
                          color: realAnalytics.moodTrend === 'improving' ? Colors.success : 
                                 realAnalytics.moodTrend === 'declining' ? Colors.warning : Colors.primary 
                        }]}>
                          {realAnalytics.moodTrend.charAt(0).toUpperCase() + realAnalytics.moodTrend.slice(1)}
                        </Text>
                        <Text style={styles.overviewLabel}>Trend</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.analyticsSection}>
                    <Text style={styles.analyticsSectionTitle}>Mood Distribution</Text>
                    {Object.entries(realAnalytics.moodDistribution).map(([mood, count]) => (
                      <View key={mood} style={styles.distributionItem}>
                        <Text style={styles.distributionMood}>
                          {mood === 'great' ? '😊 Great' : 
                           mood === 'good' ? '🙂 Good' : 
                           mood === 'okay' ? '😐 Okay' : 
                           mood === 'low' ? '😔 Low' : '😢 Hard'}
                        </Text>
                        <View style={styles.distributionBar}>
                          <View 
                            style={[
                              styles.distributionFill, 
                              { width: `${(count / realAnalytics.totalEntries) * 100}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.distributionCount}>{count}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.analyticsSection}>
                    <Text style={styles.analyticsSectionTitle}>Time Range</Text>
                    <View style={styles.rangeButtons}>
                      {(['7d', '30d', '90d'] as const).map((range) => (
                        <TouchableOpacity
                          key={range}
                          style={[
                            styles.rangeButton,
                            analyticsRange === range && styles.selectedRangeButton
                          ]}
                          onPress={() => handleViewAnalytics(range)}
                        >
                          <Text style={[
                            styles.rangeButtonText,
                            analyticsRange === range && styles.selectedRangeButtonText
                          ]}>
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowAnalyticsModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
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
  notificationBadge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  notificationBadgeText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  languageModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
    maxHeight: '60%',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLanguageOption: {
    backgroundColor: Colors.primary + '20',
  },
  languageOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  selectedLanguageOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeLanguageModal: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeLanguageModalText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  notificationsModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    maxHeight: '80%',
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  notificationMessage: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: Colors.text.light,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  closeModalButton: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  privacyModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    maxHeight: '80%',
  },
  privacyContent: {
    maxHeight: 400,
  },
  privacySection: {
    marginBottom: 16,
  },
  privacySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  feedbackModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    maxHeight: '80%',
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: Colors.text.white,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    minHeight: 120,
    marginBottom: 16,
  },
  sendFeedbackButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sendFeedbackButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  helpModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    maxHeight: '80%',
  },
  helpContent: {
    maxHeight: 400,
  },
  helpSection: {
    marginBottom: 16,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '600',
  },
  moodSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  moodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  todayMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  updateMoodButton: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  updateMoodText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  addMoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  addMoodText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  analyticsPreview: {
    marginTop: 16,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  viewAnalyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '20',
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewAnalyticsText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  moodModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    maxHeight: '80%',
  },
  analyticsModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    maxHeight: '90%',
  },
  analyticsContent: {
    maxHeight: 500,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  analyticsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionMood: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    width: 80,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    marginHorizontal: 12,
  },
  distributionFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    width: 30,
    textAlign: 'right',
  },
  rangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeButton: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedRangeButton: {
    backgroundColor: Colors.primary,
  },
  rangeButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  selectedRangeButtonText: {
    color: Colors.text.white,
  },
});