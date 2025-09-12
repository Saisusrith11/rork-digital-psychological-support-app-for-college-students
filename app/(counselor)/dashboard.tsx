import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Modal 
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
  LogOut
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useNotifications } from '@/hooks/notification-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function CounselorDashboard() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/auth');
  };

  // Mock data for counselor dashboard
  const dashboardStats = {
    todayAppointments: 3,
    pendingRequests: 5,
    totalStudents: 24,
    urgentCases: 2,
  };

  const todayAppointments = [
    {
      id: '1',
      studentName: 'Anonymous Student',
      time: '10:00 AM',
      type: 'Initial Consultation',
      status: 'confirmed',
    },
    {
      id: '2',
      studentName: 'Student #2847',
      time: '2:00 PM',
      type: 'Follow-up',
      status: 'pending',
    },
    {
      id: '3',
      studentName: 'Anonymous Student',
      time: '4:00 PM',
      type: 'Crisis Support',
      status: 'urgent',
    },
  ];

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
            <TouchableOpacity style={styles.notificationButton}>
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
              <Text style={styles.statNumber}>{dashboardStats.todayAppointments}</Text>
              <Text style={styles.statLabel}>Today's Sessions</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.secondary + '20' }]}>
              <Clock size={24} color={Colors.secondary} />
              <Text style={styles.statNumber}>{dashboardStats.pendingRequests}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.success + '20' }]}>
              <Users size={24} color={Colors.success} />
              <Text style={styles.statNumber}>{dashboardStats.totalStudents}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.error + '20' }]}>
              <AlertCircle size={24} color={Colors.error} />
              <Text style={styles.statNumber}>{dashboardStats.urgentCases}</Text>
              <Text style={styles.statLabel}>Urgent Cases</Text>
            </View>
          </View>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          {todayAppointments.map((appointment) => (
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
          ))}
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <MessageSquare size={20} color={Colors.primary} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No new notifications</Text>
            </View>
          )}
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
              <TrendingUp size={24} color={Colors.secondary} />
              <Text style={styles.actionButtonText}>Analytics</Text>
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
});