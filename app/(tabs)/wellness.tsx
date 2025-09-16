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
  Award,
  Gift,
  Crown,

  Calendar,
  Sunrise,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useWellness } from '@/hooks/wellness-store';
import { WellnessActivity, WellnessBadge } from '@/types/wellness';
import { CATEGORY_COLORS, CATEGORY_ICONS, RISK_LEVEL_COLORS, TIER_COLORS, TIER_NAMES, TIER_THRESHOLDS } from '@/constants/wellness-activities';

const ICON_MAP = {
  heart: Heart,
  brain: Brain,
  users: Users,
  'book-open': BookOpen,
  'shield-alert': ShieldAlert,
  target: Target,
  flame: Flame,
  clock: Clock,
  trophy: Trophy,
  award: Award,
  sunrise: Sunrise,
  calendar: Calendar,
};

export default function WellnessScreen() {
  const insets = useSafeAreaInsets();
  const {
    progress,
    getCurrentRiskLevel,
    getCurrentTier,
    getAvailableActivities,
    completeActivity,
    getStats,
    getDailyQuote,
    getEarnedBadges,
    getAvailableBadges,
    getAvailableRewards,
    unlockReward,
  } = useWellness();


  const [completingActivity, setCompletingActivity] = useState<string | null>(null);
  const [unlockingReward, setUnlockingReward] = useState<string | null>(null);
  const [showBadges, setShowBadges] = useState<boolean>(false);
  const [showRewards, setShowRewards] = useState<boolean>(false);
  const [newBadgeNotification, setNewBadgeNotification] = useState<WellnessBadge | null>(null);

  const riskLevel = getCurrentRiskLevel();
  const currentTier = getCurrentTier();
  const activities = getAvailableActivities();
  const stats = getStats();
  const dailyQuote = getDailyQuote();
  const earnedBadges = getEarnedBadges();
  const availableBadges = getAvailableBadges();
  const availableRewards = getAvailableRewards();



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
        if (result.newBadges && result.newBadges.length > 0) {
          console.log('New badges earned:', result.newBadges.map(b => b.title).join(', '));
          // Show notification for the first new badge
          setNewBadgeNotification(result.newBadges[0]);
          setTimeout(() => setNewBadgeNotification(null), 4000);
        }
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    } finally {
      setCompletingActivity(null);
    }
  }, [completeActivity]);

  const handleUnlockReward = useCallback(async (rewardId: string) => {
    setUnlockingReward(rewardId);
    try {
      const result = await unlockReward(rewardId);
      if (result.success) {
        console.log(`Reward unlocked: ${result.reward.title}`);
      }
    } catch (error) {
      console.error('Error unlocking reward:', error);
    } finally {
      setUnlockingReward(null);
    }
  }, [unlockReward]);

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

  const renderTierCard = () => {
    const tierColor = TIER_COLORS[currentTier];
    const tierName = TIER_NAMES[currentTier];
    const availablePoints = progress.totalPoints - progress.spentPoints;
    
    return (
      <View style={styles.tierCard}>
        <View style={styles.tierHeader}>
          <View style={[styles.tierIcon, { backgroundColor: tierColor + '20' }]}>
            <Crown size={24} color={tierColor} />
          </View>
          <View style={styles.tierInfo}>
            <Text style={styles.tierTitle}>{tierName} Tier</Text>
            <Text style={styles.tierSubtitle}>{availablePoints} points available</Text>
          </View>
          <TouchableOpacity 
            style={styles.rewardsButton}
            onPress={() => setShowRewards(true)}
          >
            <Gift size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {stats.pointsToNextTier > 0 && (
          <View style={styles.tierProgress}>
            <View style={styles.tierProgressBar}>
              <View
                style={[
                  styles.tierProgressFill,
                  {
                    width: `${Math.max(0, Math.min(100, ((progress.totalPoints - TIER_THRESHOLDS[currentTier]) / (stats.pointsToNextTier + (progress.totalPoints - TIER_THRESHOLDS[currentTier]))) * 100))}%`,
                    backgroundColor: tierColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.tierProgressText}>
              {stats.pointsToNextTier} points to next tier
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Your Progress</Text>
        <TouchableOpacity 
          style={styles.badgesButton}
          onPress={() => setShowBadges(true)}
        >
          <Award size={20} color={Colors.primary} />
          <Text style={styles.badgesCount}>{earnedBadges.length}</Text>
        </TouchableOpacity>
      </View>
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

        {renderTierCard()}
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

        {/* Recent Badges */}
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
              {earnedBadges.slice(0, 5).map((badge) => {
                const IconComponent = ICON_MAP[badge.icon as keyof typeof ICON_MAP] || Award;
                const tierColor = badge.tier ? TIER_COLORS[badge.tier] : Colors.primary;
                return (
                  <View key={badge.id} style={[styles.badgeCard, { borderColor: tierColor }]}>
                    <View style={[styles.badgeIcon, { backgroundColor: tierColor + '20' }]}>
                      <IconComponent size={20} color={tierColor} />
                    </View>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <Text style={styles.badgePoints}>+{badge.points} WP</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Badges Modal */}
      {showBadges && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Achievements</Text>
              <TouchableOpacity onPress={() => setShowBadges(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalSectionTitle}>Earned ({earnedBadges.length})</Text>
              {earnedBadges.map((badge) => {
                const IconComponent = ICON_MAP[badge.icon as keyof typeof ICON_MAP] || Award;
                const tierColor = badge.tier ? TIER_COLORS[badge.tier] : Colors.primary;
                return (
                  <View key={badge.id} style={styles.modalBadgeCard}>
                    <View style={[styles.modalBadgeIcon, { backgroundColor: tierColor + '20' }]}>
                      <IconComponent size={24} color={tierColor} />
                    </View>
                    <View style={styles.modalBadgeInfo}>
                      <Text style={styles.modalBadgeTitle}>{badge.title}</Text>
                      <Text style={styles.modalBadgeDescription}>{badge.description}</Text>
                    </View>
                    <Text style={styles.modalBadgePoints}>+{badge.points} WP</Text>
                  </View>
                );
              })}
              
              {availableBadges.length > 0 && (
                <>
                  <Text style={styles.modalSectionTitle}>Available ({availableBadges.length})</Text>
                  {availableBadges.slice(0, 10).map((badge) => {
                    const IconComponent = ICON_MAP[badge.icon as keyof typeof ICON_MAP] || Award;
                    const tierColor = badge.tier ? TIER_COLORS[badge.tier] : Colors.text.light;
                    return (
                      <View key={badge.id} style={[styles.modalBadgeCard, styles.unavailableBadge]}>
                        <View style={[styles.modalBadgeIcon, { backgroundColor: Colors.surfaceLight }]}>
                          <IconComponent size={24} color={Colors.text.light} />
                        </View>
                        <View style={styles.modalBadgeInfo}>
                          <Text style={[styles.modalBadgeTitle, { color: Colors.text.light }]}>{badge.title}</Text>
                          <Text style={[styles.modalBadgeDescription, { color: Colors.text.light }]}>{badge.description}</Text>
                        </View>
                        <Text style={[styles.modalBadgePoints, { color: Colors.text.light }]}>+{badge.points} WP</Text>
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Rewards Modal */}
      {showRewards && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rewards Store</Text>
              <TouchableOpacity onPress={() => setShowRewards(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalSectionTitle}>Available Rewards</Text>
              {availableRewards.map((reward) => {
                const tierColor = TIER_COLORS[reward.tier];
                const availablePoints = progress.totalPoints - progress.spentPoints;
                const canAfford = availablePoints >= reward.cost;
                const isUnlocking = unlockingReward === reward.id;
                
                return (
                  <TouchableOpacity 
                    key={reward.id} 
                    style={[styles.rewardCard, !canAfford && styles.disabledReward]}
                    onPress={() => canAfford && !isUnlocking && handleUnlockReward(reward.id)}
                    disabled={!canAfford || isUnlocking}
                  >
                    <View style={[styles.rewardIcon, { backgroundColor: tierColor + '20' }]}>
                      <Gift size={24} color={tierColor} />
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={[styles.rewardTitle, !canAfford && { color: Colors.text.light }]}>
                        {reward.title}
                      </Text>
                      <Text style={[styles.rewardDescription, !canAfford && { color: Colors.text.light }]}>
                        {reward.description}
                      </Text>
                      <Text style={[styles.rewardTier, { color: tierColor }]}>
                        {TIER_NAMES[reward.tier]} Tier
                      </Text>
                    </View>
                    <View style={styles.rewardCost}>
                      <Text style={[styles.rewardCostText, !canAfford && { color: Colors.text.light }]}>
                        {reward.cost} WP
                      </Text>
                      {isUnlocking && <Text style={styles.unlockingText}>Unlocking...</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              {availableRewards.length === 0 && (
                <Text style={styles.noRewardsText}>
                  No rewards available for your current tier. Keep earning points to unlock higher tiers!
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      )}
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
  tierCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  tierSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  rewardsButton: {
    padding: 8,
  },
  tierProgress: {
    marginTop: 8,
  },
  tierProgressBar: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    marginBottom: 8,
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tierProgressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgesCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  badgesScroll: {
    paddingLeft: 20,
  },
  badgeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    borderWidth: 2,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgePoints: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.text.secondary,
  },
  modalScroll: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    marginTop: 8,
  },
  modalBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unavailableBadge: {
    opacity: 0.6,
  },
  modalBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalBadgeInfo: {
    flex: 1,
  },
  modalBadgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalBadgeDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  modalBadgePoints: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  disabledReward: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  rewardTier: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardCost: {
    alignItems: 'flex-end',
  },
  rewardCostText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  unlockingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  noRewardsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});