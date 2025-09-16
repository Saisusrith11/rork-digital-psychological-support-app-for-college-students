import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Heart,
  Brain,
  Users,
  BookOpen,
  ShieldAlert,
  Target,
  Trophy,
  Flame,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useWellness } from '@/hooks/wellness-store';
import { WellnessActivity } from '@/types/wellness';
import { CATEGORY_COLORS, CATEGORY_ICONS, RISK_LEVEL_COLORS } from '@/constants/wellness-activities';

const ICON_MAP = {
  heart: Heart,
  brain: Brain,
  users: Users,
  'book-open': BookOpen,
  'shield-alert': ShieldAlert,
  target: Target,
};

export default function WellnessScreen() {
  const insets = useSafeAreaInsets();
  const {
    progress,
    getCurrentRiskLevel,
    getAvailableActivities,
    completeActivity,
    getStats,
    getDailyQuote,
  } = useWellness();


  const [completingActivity, setCompletingActivity] = useState<string | null>(null);

  const riskLevel = getCurrentRiskLevel();
  const activities = getAvailableActivities();
  const stats = getStats();
  const dailyQuote = getDailyQuote();



  const handleCompleteActivity = useCallback(async (activity: WellnessActivity) => {
    if (activity.completed) {
      console.log('Activity already completed today');
      return;
    }

    setCompletingActivity(activity.id);
    try {
      const result = await completeActivity(activity.id);
      if (result.success) {
        console.log(`Activity completed: ${activity.title}, earned ${result.points} points`);
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    } finally {
      setCompletingActivity(null);
    }
  }, [completeActivity]);

  const renderActivityCard = (activity: WellnessActivity) => {
    const IconComponent = ICON_MAP[CATEGORY_ICONS[activity.category] as keyof typeof ICON_MAP] || Heart;
    const categoryColor = CATEGORY_COLORS[activity.category];
    const isCompleting = completingActivity === activity.id;

    return (
      <TouchableOpacity
        key={activity.id}
        style={[
          styles.activityCard,
          activity.completed && styles.completedCard,
        ]}
        onPress={() => handleCompleteActivity(activity)}
        disabled={activity.completed || isCompleting}
        testID={`activity-${activity.id}`}
      >
        <View style={styles.activityHeader}>
          <View style={[styles.activityIcon, { backgroundColor: categoryColor + '20' }]}>
            <IconComponent size={24} color={categoryColor} />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
          </View>
          {activity.completed ? (
            <CheckCircle size={24} color={Colors.success} />
          ) : (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{activity.points} WP</Text>
            </View>
          )}
        </View>
        {activity.duration && (
          <View style={styles.activityMeta}>
            <Clock size={16} color={Colors.text.light} />
            <Text style={styles.durationText}>{activity.duration} min</Text>
          </View>
        )}
        {isCompleting && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Completing...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Your Progress</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Trophy size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{progress.totalPoints}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statItem}>
          <Flame size={20} color={Colors.accent} />
          <Text style={styles.statValue}>{progress.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={20} color={Colors.warning} />
          <Text style={styles.statValue}>{stats.currentLevel}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={20} color={Colors.success} />
          <Text style={styles.statValue}>{progress.dailyPoints}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </View>
    </View>
  );

  const renderRiskLevelBanner = () => {
    const riskColor = RISK_LEVEL_COLORS[riskLevel];
    const riskLabels = {
      minimal: 'Minimal Risk - Positive Routine Builder',
      mild: 'Mild Risk - Mindful Growth Session',
      moderate: 'Moderate Risk - Resilience Recharge Routine',
      severe: 'Severe Risk - Stabilize & Support Pack',
    };

    return (
      <View style={[styles.riskBanner, { backgroundColor: riskColor + '20' }]}>
        <View style={[styles.riskIndicator, { backgroundColor: riskColor }]} />
        <Text style={[styles.riskText, { color: riskColor }]}>
          {riskLabels[riskLevel]}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Wellness Activities</Text>
          <Text style={styles.subtitle}>Personalized activities for your mental health journey</Text>
        </View>

        {renderRiskLevelBanner()}

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>&ldquo;{dailyQuote}&rdquo;</Text>
        </View>

        {renderStatsCard()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Activities</Text>
          <Text style={styles.sectionSubtitle}>
            Complete activities to earn Wellness Points and improve your mental health
          </Text>
        </View>

        <View style={styles.activitiesList}>
          {activities.map(renderActivityCard)}
        </View>

        {stats.pointsToNextLevel > 0 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Next Level Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(0, Math.min(100, ((progress.totalPoints % 1000) / 1000) * 100))}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {stats.pointsToNextLevel} points to level {stats.currentLevel + 1}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  riskIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  activitiesList: {
    paddingHorizontal: 20,
  },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: Colors.success + '10',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  pointsBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.surface,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  durationText: {
    fontSize: 12,
    color: Colors.text.light,
    marginLeft: 6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface + 'CC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});