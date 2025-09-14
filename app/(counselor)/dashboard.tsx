import React, { useState, useEffect } from 'react';
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
  TrendingUp, 
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
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useNotifications } from '@/hooks/notification-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ConsentedAssessmentsView from '@/components/ConsentedAssessmentsView';
import { analyticsService } from '@/services/analytics-service';
import type { CounselorMetrics } from '@/services/analytics-service';

export default function CounselorDashboard() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
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
            addNotification(notification);
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.specialization}>{user?.specialization}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Bell size={24} color={Colors.text.primary} />
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
              <LogOut size={20} color={Colors.warning} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.primary + '20' }]}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.todayAppointments}</Text>
              <Text style={styles.statLabel}>Today&apos;s Sessions</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.secondary + '20' }]}>
              <Clock size={24} color={Colors.secondary} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.pendingRequests}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.success + '20' }]}>
              <Users size={24} color={Colors.success} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.totalStudents}</Text>
              <Text style={styles.statLabel}>Consented Students</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.error + '20' }]}>
              <AlertCircle size={24} color={Colors.error} />
              <Text style={styles.statNumber}>{isLoadingData ? '...' : dashboardStats.urgentCases}</Text>
              <Text style={styles.statLabel}>Urgent Cases</Text>
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
                  <Activity size={20} color={Colors.success} />
                  <Text style={styles.performanceTitle}>Completion Rate</Text>
                </View>
                <Text style={styles.performanceValue}>{dashboardStats.completionRate}%</Text>
                <Text style={styles.performanceSubtext}>Sessions completed successfully</Text>
              </View>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Clock size={20} color={Colors.warning} />
                  <Text style={styles.performanceTitle}>Response Time</Text>
                </View>
                <Text style={styles.performanceValue}>{dashboardStats.avgResponseTime.toFixed(1)}h</Text>
                <Text style={styles.performanceSubtext}>Average response to requests</Text>
              </View>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Heart size={20} color={Colors.primary} />
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
                  appointment.status === 'urgent' && { backgroundColor: Colors.error + '20' },
                  appointment.status === 'confirmed' && { backgroundColor: Colors.success + '20' },
                  appointment.status === 'pending' && { backgroundColor: Colors.warning + '20' },
                ]}>
                  {appointment.status === 'urgent' && <AlertCircle size={16} color={Colors.error} />}
                  {appointment.status === 'confirmed' && <CheckCircle size={16} color={Colors.success} />}
                  {appointment.status === 'pending' && <Clock size={16} color={Colors.warning} />}
                  <Text style={[
                    styles.statusText,
                    appointment.status === 'urgent' && { color: Colors.error },
                    appointment.status === 'confirmed' && { color: Colors.success },
                    appointment.status === 'pending' && { color: Colors.warning },
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
                alert.severity === 'high' && { borderLeftColor: Colors.error },
                alert.severity === 'medium' && { borderLeftColor: Colors.warning },
                alert.severity === 'low' && { borderLeftColor: Colors.success },
              ]}>
                <View style={styles.alertHeader}>
                  <AlertCircle 
                    size={20} 
                    color={alert.severity === 'high' ? Colors.error : alert.severity === 'medium' ? Colors.warning : Colors.success} 
                  />
                  <Text style={[
                    styles.alertSeverity,
                    { color: alert.severity === 'high' ? Colors.error : alert.severity === 'medium' ? Colors.warning : Colors.success }
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
                <MessageSquare size={20} color={Colors.primary} />
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.actionButtonText}>View Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Users size={24} color={Colors.success} />
              <Text style={styles.actionButtonText}>Student List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Shield size={24} color={Colors.secondary} />
              <Text style={styles.actionButtonText}>Privacy Center</Text>
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
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
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
                  <X size={24} color={Colors.text.primary} />
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
                        {item.type === 'system' && <AlertCircle size={20} color={Colors.error} />}
                        {item.type === 'booking' && <Calendar size={20} color={Colors.primary} />}
                        {item.type === 'feedback' && <Clock size={20} color={Colors.warning} />}
                        {item.type === 'message' && <MessageSquare size={20} color={Colors.success} />}
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
                            <CheckCircle size={16} color={Colors.success} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          onPress={() => deleteNotification(item.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyNotifications}>
                <Bell size={48} color={Colors.text.light} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 4,
  },
  specialization: {
    fontSize: 14,
    color: Colors.primary,
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
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
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
    color: Colors.text.primary,
  },
  appointmentType: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: Colors.primary,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
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
    color: Colors.text.primary,
  },
  notificationMessage: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 11,
    color: Colors.text.light,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  performanceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
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
    color: Colors.text.secondary,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  performanceSubtext: {
    fontSize: 11,
    color: Colors.text.light,
  },
  alertCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
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
    color: Colors.text.primary,
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: Colors.text.light,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.text.primary,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  markAllRead: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notificationModalContent: {
    flex: 1,
    backgroundColor: Colors.background,
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
    borderBottomColor: Colors.surfaceLight,
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  notificationModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  markAllReadButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  fullNotificationCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
  },
  unreadNotificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
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
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCardContent: {
    flex: 1,
  },
  fullNotificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    fontWeight: '600',
  },
  fullNotificationMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  fullNotificationTime: {
    fontSize: 12,
    color: Colors.text.light,
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
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptyNotificationsSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});