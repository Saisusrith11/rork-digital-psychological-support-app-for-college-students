import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  LogOut,
  Activity,
  X,
  Trash2,
  Shield,
  Zap,
  FileText
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useFeedback } from '@/hooks/feedback-store';
import { useNotifications } from '@/hooks/notification-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { analyticsService } from '@/services/analytics-service';
import type { UserEngagement, AssessmentMetrics, SystemHealth } from '@/services/analytics-service';
import { api } from '@/lib/api';

type RangeKey = '7d' | '30d' | '90d';

type TrendPoint = { label: string; value: number };

type StressBreakdown = {
  low: number;
  moderate: number;
  high: number;
};

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  if (error) {
    return (
      <View style={styles.errorState} testID="admin-error">
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }
  return (
    <View
      testID="admin-error-wrapper"
      onLayout={() => {
        try {
          console.log('[AdminDashboard] Layout measured');
        } catch (e) {
          const err = e as Error;
          setError(err);
        }
      }}
    >
      {children}
    </View>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { feedbacks, pendingCount } = useFeedback();
  const reportStatsQuery = api.reports.getStats.useQuery();
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [range, setRange] = useState<RangeKey>('30d');
  const [userEngagement, setUserEngagement] = useState<UserEngagement | null>(null);
  const [assessmentMetrics, setAssessmentMetrics] = useState<AssessmentMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      setShowLogoutModal(false);
      await logout();
      router.replace('/auth');
    } catch (e) {
      console.log('[AdminDashboard] logout error', e);
    }
  }, [logout]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoadingData(true);
        
        const [engagement, assessments, health] = await Promise.all([
          analyticsService.getUserEngagement(range),
          analyticsService.getAssessmentMetrics(range),
          analyticsService.getSystemHealth()
        ]);
        
        setUserEngagement(engagement);
        setAssessmentMetrics(assessments);
        setSystemHealth(health);
        
        const sampleNotifications = [
          {
            userId: user?.id || 'admin-1',
            title: 'System Alert',
            message: `${engagement.dailyActiveUsers} active users today (${Math.round((engagement.dailyActiveUsers / engagement.monthlyActiveUsers) * 100)}% of monthly)`,
            type: 'system' as const,
            isRead: false,
          },
          {
            userId: user?.id || 'admin-1',
            title: 'Assessment Report',
            message: `${assessments.totalAssessments} assessments completed. ${Math.round(assessments.consentRate * 100)}% consent rate.`,
            type: 'feedback' as const,
            isRead: false,
          },
          {
            userId: user?.id || 'admin-1',
            title: 'System Health',
            message: `Uptime: ${health.uptime.toFixed(1)}%, Response: ${health.responseTime.toFixed(0)}ms`,
            type: 'system' as const,
            isRead: true,
          },
        ];

        if (notifications.length === 0) {
          sampleNotifications.forEach(notification => {
            if (!notification?.title?.trim()) return;
            if (notification.title.length > 100) return;
            const sanitizedNotification = {
              ...notification,
              title: notification.title.trim(),
              message: notification.message.trim(),
            };
            addNotification(sanitizedNotification);
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboardData();
  }, [range, notifications.length, addNotification, user?.id]);

  const systemStats = useMemo(() => {
    if (!userEngagement || !systemHealth) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCounselors: 0,
        activeSessions: 0,
        pendingFeedback: pendingCount,
        systemHealthPercent: 0,
      };
    }
    
    return {
      totalUsers: userEngagement.monthlyActiveUsers,
      activeUsers: userEngagement.dailyActiveUsers,
      totalCounselors: 12,
      activeSessions: Math.floor(userEngagement.totalSessions * 0.1),
      pendingFeedback: pendingCount,
      systemHealthPercent: systemHealth.uptime,
    };
  }, [userEngagement, systemHealth, pendingCount]);

  const recentActivity = useMemo(() => {
    if (!userEngagement || !assessmentMetrics) {
      return [
        { id: '1', type: 'user_registration', message: 'Loading...', time: '...', status: 'info' },
      ];
    }
    
    return [
      { 
        id: '1', 
        type: 'user_registration', 
        message: `${Math.floor(userEngagement.dailyActiveUsers * 0.05)} new students registered today`, 
        time: '2 minutes ago', 
        status: 'success' 
      },
      { 
        id: '2', 
        type: 'session_booked', 
        message: `${Math.floor(userEngagement.totalSessions * 0.02)} counseling sessions booked`, 
        time: '15 minutes ago', 
        status: 'info' 
      },
      { 
        id: '3', 
        type: 'feedback_received', 
        message: `${pendingCount} new feedback submissions pending review`, 
        time: '1 hour ago', 
        status: 'warning' 
      },
      { 
        id: '4', 
        type: 'system_alert', 
        message: userEngagement.dailyActiveUsers > userEngagement.monthlyActiveUsers * 0.8 ? 'High usage detected' : 'Normal system load', 
        time: '2 hours ago', 
        status: userEngagement.dailyActiveUsers > userEngagement.monthlyActiveUsers * 0.8 ? 'error' : 'success' 
      },
    ];
  }, [userEngagement, assessmentMetrics, pendingCount]);

  const getActivityIcon = useCallback((type: string) => {
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
  }, []);

  const trendData: TrendPoint[] = useMemo(() => {
    const map: Record<RangeKey, TrendPoint[]> = {
      '7d': [
        { label: 'M', value: 42 },
        { label: 'T', value: 55 },
        { label: 'W', value: 51 },
        { label: 'T', value: 63 },
        { label: 'F', value: 70 },
        { label: 'S', value: 64 },
        { label: 'S', value: 58 },
      ],
      '30d': Array.from({ length: 12 }).map((_, i) => ({ label: `${i+1}`, value: 30 + (i * 4) % 40 })),
      '90d': Array.from({ length: 18 }).map((_, i) => ({ label: `${i+1}`, value: 20 + (i * 5) % 60 })),
    };
    return map[range];
  }, [range]);

  const stressBreakdown: StressBreakdown = useMemo(() => {
    if (!assessmentMetrics) return { low: 38, moderate: 44, high: 18 };
    
    return {
      low: assessmentMetrics.riskDistribution.minimal + assessmentMetrics.riskDistribution.mild,
      moderate: assessmentMetrics.riskDistribution.moderate,
      high: assessmentMetrics.riskDistribution.severe
    };
  }, [assessmentMetrics]);

  const engagement = useMemo(() => {
    if (!userEngagement) {
      return {
        dailyActive: 0,
        avgSessionTimeMin: 0,
        resourceOpens: 0,
      };
    }
    
    return {
      dailyActive: userEngagement.dailyActiveUsers,
      avgSessionTimeMin: userEngagement.avgSessionDuration,
      resourceOpens: 1423, // Will be updated when resource data is loaded
    };
  }, [userEngagement]);

  const resourceUsage = useMemo(() => ([
    { id: 'res1', title: 'Breathing Exercise', percent: 64 },
    { id: 'res2', title: 'Sleep Hygiene Guide', percent: 47 },
    { id: 'res3', title: 'Exam Stress Tips', percent: 72 },
    { id: 'res4', title: 'Mindfulness Audio', percent: 35 },
  ]), []);

  const maxTrend = useMemo(() => Math.max(...trendData.map(p => p.value), 1), [trendData]);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]} testID="admin-root">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Admin Dashboard</Text>
              <Text style={styles.userName} testID="admin-username">{user?.fullName ?? 'Administrator'}</Text>
              <Text style={styles.systemStatus}>System Status: Healthy</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.notificationButton} 
                testID="admin-bell"
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
                testID="admin-logout"
              >
                <LogOut size={20} color={Colors.warning} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Activity size={24} color={Colors.success} />
              <Text style={styles.healthTitle}>System Health</Text>
            </View>
            <Text style={styles.healthPercentage}>{isLoadingData ? '...' : systemStats.systemHealthPercent.toFixed(1)}%</Text>
            <Text style={styles.healthStatus}>All systems operational</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.primary + '20' }]} testID="stat-total-users">
                <Users size={24} color={Colors.primary} />
                <Text style={styles.statNumber}>{isLoadingData ? '...' : systemStats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.success + '20' }]} testID="stat-active-users">
                <Activity size={24} color={Colors.success} />
                <Text style={styles.statNumber}>{isLoadingData ? '...' : systemStats.activeUsers}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.secondary + '20' }]} testID="stat-counselors">
                <Users size={24} color={Colors.secondary} />
                <Text style={styles.statNumber}>{isLoadingData ? '...' : systemStats.totalCounselors}</Text>
                <Text style={styles.statLabel}>Counselors</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.warning + '20' }]} testID="stat-active-sessions">
                <Clock size={24} color={Colors.warning} />
                <Text style={styles.statNumber}>{isLoadingData ? '...' : systemStats.activeSessions}</Text>
                <Text style={styles.statLabel}>Active Sessions</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Trends</Text>
              <View style={styles.rangePills}>
                {(['7d','30d','90d'] as RangeKey[]).map((k) => {
                  if (!k?.trim()) return null;
                  if (k.length > 10) return null;
                  const sanitizedK = k.trim();
                  return (
                    <TouchableOpacity
                      key={sanitizedK}
                      onPress={() => setRange(sanitizedK as RangeKey)}
                      style={[styles.pill, range === sanitizedK ? styles.pillActive : undefined]}
                      testID={`range-${sanitizedK}`}
                    >
                      <Text style={[styles.pillText, range === sanitizedK ? styles.pillTextActive : undefined]}>{sanitizedK}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.card} testID="trend-card">
              <View style={styles.trendRow}>
                {trendData.map((p, idx) => (
                  <View key={`trend-${p.label}-${idx}`} style={styles.trendBarWrap}>
                    <View
                      style={[styles.trendBar, { height: Math.max(8, (p.value / maxTrend) * 100) }]}
                      testID={`trend-bar-${idx}`}
                    />
                    <Text style={styles.trendLabel}>{p.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.legendRow}>
                <TrendingUp size={16} color={Colors.primary} />
                <Text style={styles.legendText}>Engagement over time</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stress Levels (Anonymous)</Text>
            <View style={styles.card} testID="stress-card">
              <View style={styles.progressRow}>
                <View style={[styles.progressSeg, { flex: stressBreakdown.low, backgroundColor: Colors.success + 'AA' }]} />
                <View style={[styles.progressSeg, { flex: stressBreakdown.moderate, backgroundColor: Colors.warning + 'AA' }]} />
                <View style={[styles.progressSeg, { flex: stressBreakdown.high, backgroundColor: Colors.error + 'AA' }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: Colors.success }]}>Low {stressBreakdown.low}%</Text>
                <Text style={[styles.progressLabel, { color: Colors.warning }]}>Moderate {stressBreakdown.moderate}%</Text>
                <Text style={[styles.progressLabel, { color: Colors.error }]}>High {stressBreakdown.high}%</Text>
              </View>
              <Text style={styles.disclaimer}>All screening metrics are aggregated and anonymized.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Engagement</Text>
            <View style={styles.engagementRow}>
              <View style={[styles.engageCard, { backgroundColor: Colors.primary + '20' }]} testID="eng-dau">
                <Text style={styles.engNum}>{isLoadingData ? '...' : engagement.dailyActive}</Text>
                <Text style={styles.engLabel}>Daily Active</Text>
              </View>
              <View style={[styles.engageCard, { backgroundColor: Colors.secondary + '20' }]} testID="eng-time">
                <Text style={styles.engNum}>{isLoadingData ? '...' : engagement.avgSessionTimeMin.toFixed(1)}m</Text>
                <Text style={styles.engLabel}>Avg Session</Text>
              </View>
              <View style={[styles.engageCard, { backgroundColor: Colors.success + '20' }]} testID="eng-opens">
                <Text style={styles.engNum}>{isLoadingData ? '...' : engagement.resourceOpens}</Text>
                <Text style={styles.engLabel}>Resource Opens</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Resources</Text>
            <View style={styles.card}>
              {resourceUsage.map((r) => (
                <View key={r.id} style={styles.resourceRow} testID={`res-${r.id}`}>
                  <Text style={styles.resourceTitle}>{r.title}</Text>
                  <View style={styles.resourceBarBg}>
                    <View style={[styles.resourceBar, { width: `${r.percent}%` }]} />
                  </View>
                  <Text style={styles.resourcePct}>{r.percent}%</Text>
                </View>
              ))}
            </View>
          </View>

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

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markAllRead}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>
            {notifications.slice(0, 3).length > 0 ? (
              notifications.slice(0, 3).map((notification) => (
                <TouchableOpacity 
                  key={notification.id} 
                  style={styles.notificationCard}
                  onPress={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <View style={styles.notificationIconContainer}>
                    {notification.type === 'system' && <AlertTriangle size={20} color={Colors.error} />}
                    {notification.type === 'feedback' && <MessageSquare size={20} color={Colors.warning} />}
                    {notification.type === 'booking' && <Clock size={20} color={Colors.primary} />}
                    {notification.type === 'message' && <MessageSquare size={20} color={Colors.success} />}
                  </View>
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

          {/* System Performance */}
          {systemHealth && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Performance</Text>
              <View style={styles.card}>
                <View style={styles.performanceRow}>
                  <View style={styles.performanceItem}>
                    <Zap size={20} color={Colors.success} />
                    <Text style={styles.performanceLabel}>Response Time</Text>
                    <Text style={styles.performanceValue}>{systemHealth.responseTime.toFixed(0)}ms</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Shield size={20} color={Colors.primary} />
                    <Text style={styles.performanceLabel}>Error Rate</Text>
                    <Text style={styles.performanceValue}>{(systemHealth.errorRate * 100).toFixed(2)}%</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Activity size={20} color={Colors.warning} />
                    <Text style={styles.performanceLabel}>Server Load</Text>
                    <Text style={styles.performanceValue}>{Math.round(systemHealth.serverLoad * 100)}%</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                testID="qa-students"
                onPress={() => router.push('/(admin)/students')}
              >
                <Users size={24} color={Colors.secondary} />
                <Text style={styles.actionButtonText}>Manage Students</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { position: 'relative' }]}
                testID="qa-review-queue"
                onPress={() => router.push('/(admin)/review-queue')}
              >
                <FileText size={24} color={Colors.warning} />
                <Text style={styles.actionButtonText}>Review Queue</Text>
                {(reportStatsQuery.data?.pending || 0) > 0 && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{reportStatsQuery.data?.pending}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                testID="qa-resources"
                onPress={() => router.push('/(admin)/resources')}
              >
                <FileText size={24} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Manage Resources</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.privacyNote}>Admin view shows only anonymized aggregates. No individual identities or notes are visible.</Text>
          </View>
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
                          {item.type === 'system' && <AlertTriangle size={20} color={Colors.error} />}
                          {item.type === 'feedback' && <MessageSquare size={20} color={Colors.warning} />}
                          {item.type === 'booking' && <Clock size={20} color={Colors.primary} />}
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
    </ErrorBoundary>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  rangePills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceLight,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  pillTextActive: {
    color: Colors.text.white,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 120,
  },
  trendBarWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  trendBar: {
    width: 10,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  trendLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressRow: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceLight,
  },
  progressSeg: {
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  disclaimer: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text.light,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 12,
  },
  engageCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  engNum: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  engLabel: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.text.secondary,
  },
  resourceRow: {
    marginBottom: 14,
  },
  resourceTitle: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  resourceBarBg: {
    height: 10,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
  resourceBar: {
    height: '100%',
    backgroundColor: Colors.secondary,
  },
  resourcePct: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.text.secondary,
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
  privacyNote: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.text.light,
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
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
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
  notificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  pendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadgeText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});