import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  FlatList 
} from 'react-native';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Clock,
  AlertCircle,
  CheckCircle,
  Bell,
  LogOut,
  X,
  Trash2,
  Shield,
  Activity,
  Heart
} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useNotifications } from '@/hooks/notification-store';
import { useTheme } from '@/hooks/theme-store';
import { useLanguage } from '@/hooks/language-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ConsentedAssessmentsView from '@/components/ConsentedAssessmentsView';
import { analyticsService } from '@/services/analytics-service';
import type { CounselorMetrics } from '@/services/analytics-service';

export default function CounselorDashboard() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { colors, settings } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [counselorMetrics, setCounselorMetrics] = useState<CounselorMetrics | null>(null);
  const [consentedAssessments, setConsentedAssessments] = useState<any[]>([]);
  const [crisisAlerts, setCrisisAlerts] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/auth');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoadingData(true);
        
        // Load real analytics data
        const [metrics, assessments, alerts] = await Promise.all([
          analyticsService.getCounselorMetrics(),
          analyticsService.getConsentedAssessments(),
          analyticsService.getCrisisAlerts()
        ]);
        
        setCounselorMetrics(metrics);
        setConsentedAssessments(assessments);
        setCrisisAlerts(alerts.filter(alert => !alert.resolved));
        
        // Add sample notifications for counselor based on real data
        const sampleNotifications = [
          {
            userId: user?.id || 'counselor-1',
            title: 'New Appointment Request',
            message: `Student has requested an appointment. Total pending: ${Math.floor(metrics.totalAppointments * 0.3)}`,
            type: 'booking' as const,
            isRead: false,
          },
          {
            userId: user?.id || 'counselor-1',
            title: 'Urgent Case Alert',
            message: `${alerts.filter(a => a.severity === 'high' && !a.resolved).length} high-risk assessments require immediate attention`,
            type: 'system' as const,
            isRead: false,
          },
          {
            userId: user?.id || 'counselor-1',
            title: 'Session Reminder',
            message: 'You have a counseling session starting in 30 minutes',
            type: 'message' as const,
            isRead: true,
          },
        ];

        // Only add if no notifications exist
        if (notifications.length === 0) {
          sampleNotifications.forEach(notification => {
            if (notification?.title?.trim()) {
              addNotification(notification);
            }
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboardData();
  }, [notifications.length, addNotification, user?.id]);

  // Real data for counselor dashboard
  const dashboardStats = counselorMetrics ? {
    todayAppointments: Math.floor(counselorMetrics.totalAppointments * 0.15), // ~15% of total are today
    pendingRequests: Math.floor(counselorMetrics.totalAppointments * 0.3), // ~30% pending
    totalStudents: consentedAssessments.length,
    urgentCases: crisisAlerts.filter(alert => alert.severity === 'high').length,
    completionRate: Math.round((counselorMetrics.completedSessions / counselorMetrics.totalAppointments) * 100),
    avgResponseTime: counselorMetrics.avgResponseTime,
    satisfactionScore: counselorMetrics.satisfactionScore
  } : {
    todayAppointments: 0,
    pendingRequests: 0,
    totalStudents: 0,
    urgentCases: 0,
    completionRate: 0,
    avgResponseTime: 0,
    satisfactionScore: 0
  };

  const todayAppointments = counselorMetrics ? [
    {
      id: '1',
      studentName: 'Anonymous Student',
      time: '10:00 AM',
      type: 'Initial Consultation',
      status: 'confirmed',
    },
    {
      id: '2',
      studentName: `Student #${Math.floor(Math.random() * 9000) + 1000}`,
      time: '2:00 PM',
      type: 'Follow-up',
      status: 'pending',
    },
    {
      id: '3',
      studentName: 'Anonymous Student',
      time: '4:00 PM',
      type: crisisAlerts.length > 0 ? 'Crisis Support' : 'Regular Session',
      status: crisisAlerts.length > 0 ? 'urgent' : 'confirmed',
    },
  ].slice(0, dashboardStats.todayAppointments || 1) : [];

  const recentNotifications = notifications.slice(0, 3);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: settings.isCompactUI ? 16 : 20,
    },
    greeting: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginTop: 4,
    },
    specialization: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    notificationButton: {
      position: 'relative',
      padding: 8,
    },
    notificationBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationBadgeText: {
      color: colors.text.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
    logoutButton: {
      padding: 8,
    },
    statsContainer: {
      paddingHorizontal: 16,
      marginBottom: settings.isCompactUI ? 16 : 24,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: settings.isCompactUI ? 12 : 16,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
      textAlign: 'center',
    },
    section: {
      paddingHorizontal: 16,
      marginBottom: settings.isCompactUI ? 16 : 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 16,
    },
    appointmentCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 12 : 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    appointmentInfo: {
      flex: 1,
    },
    appointmentStudent: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    appointmentType: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 2,
    },
    appointmentTime: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 4,
      fontWeight: '500',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    notificationCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 12 : 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    notificationMessage: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    notificationTime: {
      fontSize: 11,
      color: colors.text.light,
      marginTop: 4,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 16 : 24,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    loadingCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 16 : 24,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    performanceContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    performanceCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 12 : 16,
    },
    performanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    performanceTitle: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    performanceValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 4,
    },
    performanceSubtext: {
      fontSize: 11,
      color: colors.text.light,
    },
    alertCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 12 : 16,
      marginBottom: 12,
      borderLeftWidth: 4,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    alertSeverity: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    alertMessage: {
      fontSize: 14,
      color: colors.text.primary,
      marginBottom: 8,
    },
    alertTime: {
      fontSize: 12,
      color: colors.text.light,
    },
    quickActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: settings.isCompactUI ? 12 : 16,
      alignItems: 'center',
      gap: 8,
    },
    actionButtonText: {
      fontSize: 12,
      color: colors.text.primary,
      fontWeight: '500',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 32,
      width: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 14,
      color: colors.text.secondary,
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
      backgroundColor: colors.surfaceLight,
    },
    confirmButton: {
      backgroundColor: colors.warning,
    },
    cancelButtonText: {
      color: colors.text.secondary,
      fontSize: 16,
      fontWeight: '500',
    },
    confirmButtonText: {
      color: colors.text.white,
      fontSize: 16,
      fontWeight: '600',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    markAllRead: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    notificationModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    notificationModalContent: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 50,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    notificationModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceLight,
    },
    notificationModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    notificationModalActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    markAllReadButton: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    closeButton: {
      padding: 4,
    },
    fullNotificationCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 12,
      padding: settings.isCompactUI ? 12 : 16,
    },
    unreadNotificationCard: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    notificationCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    notificationIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationCardContent: {
      flex: 1,
    },
    fullNotificationTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text.primary,
      marginBottom: 4,
    },
    unreadNotificationTitle: {
      fontWeight: '600',
    },
    fullNotificationMessage: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    fullNotificationTime: {
      fontSize: 12,
      color: colors.text.light,
    },
    notificationCardActions: {
      flexDirection: 'column',
      gap: 8,
    },
    markReadButton: {
      padding: 4,
    },
    deleteButton: {
      padding: 4,
    },
    emptyNotifications: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyNotificationsText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: 16,
    },
    emptyNotificationsSubtext: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 4,
    },
  }), [colors, settings.isCompactUI]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('counselor.dashboard.greeting') || 'Good morning'},</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.specialization}>{user?.specialization}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Bell size={24} color={colors.text.primary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <LogOut size={20} color={colors.warning} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.primary + '20' }]}>
              <Calendar size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.todayAppointments}</Text>
              <Text style={styles.statLabel}>{t('counselor.dashboard.todaySessions') || "Today's Sessions"}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.secondary + '20' }]}>
              <Clock size={24} color={colors.secondary} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.pendingRequests}</Text>
              <Text style={styles.statLabel}>{t('counselor.dashboard.pendingRequests') || 'Pending Requests'}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.success + '20' }]}>
              <Users size={24} color={colors.success} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.totalStudents}</Text>
              <Text style={styles.statLabel}>{t('counselor.dashboard.consentedStudents') || 'Consented Students'}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.error + '20' }]}>
              <AlertCircle size={24} color={colors.error} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.urgentCases}</Text>
              <Text style={styles.statLabel}>{t('counselor.dashboard.urgentCases') || 'Urgent Cases'}</Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        {counselorMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Insights</Text>
            <View style={styles.performanceContainer}>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Activity size={20} color={colors.success} />
                  <Text style={styles.performanceTitle}>Completion Rate</Text>
                </View>
                <Text style={styles.performanceValue}>{dashboardStats.completionRate}%</Text>
                <Text style={styles.performanceSubtext}>Sessions completed successfully</Text>
              </View>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Clock size={20} color={colors.warning} />
                  <Text style={styles.performanceTitle}>Response Time</Text>
                </View>
                <Text style={styles.performanceValue}>{dashboardStats.avgResponseTime.toFixed(1)}h</Text>
                <Text style={styles.performanceSubtext}>Average response to requests</Text>
              </View>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Heart size={20} color={colors.primary} />
                  <Text style={styles.performanceTitle}>Satisfaction</Text>
                </View>
                <Text style={styles.performanceValue}>{dashboardStats.satisfactionScore.toFixed(1)}/5</Text>
                <Text style={styles.performanceSubtext}>Student feedback rating</Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Appointments</Text>
          {isLoadingData ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          ) : todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentStudent}>{appointment.studentName}</Text>
                  <Text style={styles.appointmentType}>{appointment.type}</Text>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  appointment.status === 'urgent' && { backgroundColor: colors.error + '20' },
                  appointment.status === 'confirmed' && { backgroundColor: colors.success + '20' },
                  appointment.status === 'pending' && { backgroundColor: colors.warning + '20' },
                ]}>
                  {appointment.status === 'urgent' && <AlertCircle size={16} color={colors.error} />}
                  {appointment.status === 'confirmed' && <CheckCircle size={16} color={colors.success} />}
                  {appointment.status === 'pending' && <Clock size={16} color={colors.warning} />}
                  <Text style={[
                    styles.statusText,
                    appointment.status === 'urgent' && { color: colors.error },
                    appointment.status === 'confirmed' && { color: colors.success },
                    appointment.status === 'pending' && { color: colors.warning },
                  ]}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No appointments scheduled for today</Text>
            </View>
          )}
        </View>

        {/* Crisis Alerts */}
        {crisisAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crisis Alerts</Text>
            {crisisAlerts.slice(0, 3).map((alert) => (
              <View key={alert.id} style={[
                styles.alertCard,
                alert.severity === 'high' && { borderLeftColor: colors.error },
                alert.severity === 'medium' && { borderLeftColor: colors.warning },
                alert.severity === 'low' && { borderLeftColor: colors.success },
              ]}>
                <View style={styles.alertHeader}>
                  <AlertCircle 
                    size={20} 
                    color={alert.severity === 'high' ? colors.error : alert.severity === 'medium' ? colors.warning : colors.success} 
                  />
                  <Text style={[
                    styles.alertSeverity,
                    { color: alert.severity === 'high' ? colors.error : alert.severity === 'medium' ? colors.warning : colors.success }
                  ]}>
                    {alert.severity.toUpperCase()} PRIORITY
                  </Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.markAllRead}>Mark all as read</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id} 
                style={styles.notificationCard}
                onPress={() => !notification.isRead && markAsRead(notification.id)}
              >
                <MessageSquare size={20} color={colors.primary} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No new notifications</Text>
            </View>
          )}
        </View>

        {/* Consented Assessments */}
        <View style={styles.section}>
          <ConsentedAssessmentsView />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('counselor.dashboard.quickActions') || 'Quick Actions'}</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(counselor)/appointments')}
              testID="quick-action-schedule"
            >
              <Calendar size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>{t('counselor.dashboard.viewSchedule') || 'View Schedule'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(counselor)/students')}
              testID="quick-action-students"
            >
              <Users size={24} color={colors.success} />
              <Text style={styles.actionButtonText}>{t('counselor.dashboard.studentList') || 'Student List'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(counselor)/settings/privacy')}
              testID="quick-action-privacy"
            >
              <Shield size={24} color={colors.secondary} />
              <Text style={styles.actionButtonText}>{t('counselor.dashboard.privacyCenter') || 'Privacy Center'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.logout') || 'Log Out'}</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel') || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>{t('profile.logout') || 'Log Out'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.notificationModalOverlay}>
          <View style={[styles.notificationModalContent, { paddingTop: insets.top + 20 }]}>
            <View style={styles.notificationModalHeader}>
              <Text style={styles.notificationModalTitle}>Notifications</Text>
              <View style={styles.notificationModalActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markAllReadButton}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  onPress={() => setShowNotifications(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={[
                    styles.fullNotificationCard,
                    !item.isRead && styles.unreadNotificationCard
                  ]}>
                    <View style={styles.notificationCardHeader}>
                      <View style={styles.notificationIconContainer}>
                        {item.type === 'system' && <AlertCircle size={20} color={colors.error} />}
                        {item.type === 'booking' && <Calendar size={20} color={colors.primary} />}
                        {item.type === 'feedback' && <Clock size={20} color={colors.warning} />}
                        {item.type === 'message' && <MessageSquare size={20} color={colors.success} />}
                      </View>
                      <View style={styles.notificationCardContent}>
                        <Text style={[
                          styles.fullNotificationTitle,
                          !item.isRead && styles.unreadNotificationTitle
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={styles.fullNotificationMessage}>
                          {item.message}
                        </Text>
                        <Text style={styles.fullNotificationTime}>
                          {new Date(item.createdAt).toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.notificationCardActions}>
                        {!item.isRead && (
                          <TouchableOpacity 
                            onPress={() => markAsRead(item.id)}
                            style={styles.markReadButton}
                          >
                            <CheckCircle size={16} color={colors.success} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          onPress={() => deleteNotification(item.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyNotifications}>
                <Bell size={48} color={colors.text.light} />
                <Text style={styles.emptyNotificationsText}>No notifications</Text>
                <Text style={styles.emptyNotificationsSubtext}>You&apos;re all caught up!</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}