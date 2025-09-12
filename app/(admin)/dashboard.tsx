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
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  LogOut,
  Activity
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useFeedback } from '@/hooks/feedback-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { feedbacks, pendingCount } = useFeedback();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/auth');
  };

  // Mock data for admin dashboard
  const systemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalCounselors: 12,
    activeSessions: 34,
    pendingFeedback: pendingCount,
    systemHealth: 98.5,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'user_registration',
      message: 'New student registered',
      time: '2 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'session_booked',
      message: 'Counseling session booked',
      time: '15 minutes ago',
      status: 'info',
    },
    {
      id: '3',
      type: 'feedback_received',
      message: 'New feedback submitted',
      time: '1 hour ago',
      status: 'warning',
    },
    {
      id: '4',
      type: 'system_alert',
      message: 'High usage detected',
      time: '2 hours ago',
      status: 'error',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users size={16} color={Colors.success} />;
      case 'session_booked':
        return <CheckCircle size={16} color={Colors.primary} />;
      case 'feedback_received':
        return <MessageSquare size={16} color={Colors.warning} />;
      case 'system_alert':
        return <AlertTriangle size={16} color={Colors.error} />;
      default:
        return <Activity size={16} color={Colors.text.secondary} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.systemStatus}>System Status: Healthy</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={24} color={Colors.text.primary} />
              {pendingCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{pendingCount}</Text>
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

        {/* System Health */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Activity size={24} color={Colors.success} />
            <Text style={styles.healthTitle}>System Health</Text>
          </View>
          <Text style={styles.healthPercentage}>{systemStats.systemHealth}%</Text>
          <Text style={styles.healthStatus}>All systems operational</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.primary + '20' }]}>
              <Users size={24} color={Colors.primary} />
              <Text style={styles.statNumber}>{systemStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.success + '20' }]}>
              <Activity size={24} color={Colors.success} />
              <Text style={styles.statNumber}>{systemStats.activeUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.secondary + '20' }]}>
              <Users size={24} color={Colors.secondary} />
              <Text style={styles.statNumber}>{systemStats.totalCounselors}</Text>
              <Text style={styles.statLabel}>Counselors</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.warning + '20' }]}>
              <Clock size={24} color={Colors.warning} />
              <Text style={styles.statNumber}>{systemStats.activeSessions}</Text>
              <Text style={styles.statLabel}>Active Sessions</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                {getActivityIcon(activity.type)}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pending Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Feedback ({pendingCount})</Text>
          {feedbacks.filter(f => f.status === 'pending').slice(0, 3).map((feedback) => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackUser}>{feedback.userName}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: Colors.warning + '20' }]}>
                  <Text style={[styles.categoryText, { color: Colors.warning }]}>
                    {feedback.category}
                  </Text>
                </View>
              </View>
              <Text style={styles.feedbackMessage} numberOfLines={2}>
                {feedback.message}
              </Text>
              <Text style={styles.feedbackTime}>
                {new Date(feedback.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
          {pendingCount === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No pending feedback</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <BarChart3 size={24} color={Colors.primary} />
              <Text style={styles.actionButtonText}>View Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Users size={24} color={Colors.success} />
              <Text style={styles.actionButtonText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageSquare size={24} color={Colors.warning} />
              <Text style={styles.actionButtonText}>Review Feedback</Text>
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
  systemStatus: {
    fontSize: 14,
    color: Colors.success,
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
  healthCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  healthPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.success,
  },
  healthStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
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
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  feedbackCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackUser: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  feedbackMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  feedbackTime: {
    fontSize: 12,
    color: Colors.text.light,
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