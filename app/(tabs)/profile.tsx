import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Switch, TextInput } from 'react-native';
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
  Eye,
  EyeOff
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useNotifications } from '@/hooks/notification-store';
import { useFeedback } from '@/hooks/feedback-store';
import { useLanguage } from '@/hooks/language-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { submitFeedback } = useFeedback();
  const { currentLanguage, setLanguage } = useLanguage();
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
    setLanguage(languageCode);
    setShowLanguageModal(false);
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      submitFeedback({
        userId: user?.id || 'anonymous',
        userName: user?.showUsername ? user.fullName : 'Anonymous User',
        message: feedbackText.trim(),
        category: feedbackCategory,
      });
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
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/booking')}
          >
            <Calendar size={24} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Book Session</Text>
              <Text style={styles.actionSubtitle}>Schedule counseling</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/weekly-report')}
          >
            <TrendingUp size={24} color={Colors.success} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mood Tracking</Text>
              <Text style={styles.actionSubtitle}>View insights</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowNotificationsModal(true)}
          >
            <Bell size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Notifications</Text>
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
              <Text style={styles.settingText}>Privacy & Data</Text>
              <ChevronRight size={16} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <Globe size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Language</Text>
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
              <Text style={styles.settingText}>Help & Support</Text>
              <ChevronRight size={16} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowFeedbackModal(true)}
          >
            <MessageSquare size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Send Feedback</Text>
              <ChevronRight size={16} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <User size={20} color={Colors.text.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Show Username</Text>
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
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          </View>
          
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity key={index} style={styles.emergencyContact}>
              <Phone size={16} color={Colors.error} />
              <Text style={styles.emergencyText}>{contact.name}: {contact.number}</Text>
            </TouchableOpacity>
          ))}
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
                  • Complete the mental health assessment to get personalized recommendations\n
                  • Explore resources for stress management and wellness\n
                  • Book confidential counseling sessions when needed
                </Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Emergency Support</Text>
                <Text style={styles.helpText}>
                  If you're experiencing a mental health crisis, please contact emergency services 
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
});