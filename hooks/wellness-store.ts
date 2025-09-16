import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { WellnessProgress, WellnessStats, ActivityCompletion, WellnessActivity, RiskLevel, WellnessTier, WellnessBadge, WellnessReward } from '@/types/wellness';
import { WELLNESS_ACTIVITIES, LEVEL_THRESHOLDS, WELLNESS_QUOTES, TIER_THRESHOLDS, WELLNESS_BADGES, WELLNESS_REWARDS } from '@/constants/wellness-activities';
import { useAssessment } from './assessment-store';
import { safeJsonParse, safeJsonStringify } from '@/utils/safe-json-parse';

const WELLNESS_STORAGE_KEY = 'wellness_progress';
const COMPLETIONS_STORAGE_KEY = 'wellness_completions';

export const [WellnessProvider, useWellness] = createContextHook(() => {
  const { getLatestAssessment } = useAssessment();
  const [progress, setProgress] = useState<WellnessProgress>({
    totalPoints: 0,
    dailyPoints: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    completedActivities: [],
    streak: 0,
    earnedBadges: [],
    unlockedRewards: [],
    spentPoints: 0,
  });
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      const [progressData, completionsData] = await Promise.all([
        AsyncStorage.getItem(WELLNESS_STORAGE_KEY),
        AsyncStorage.getItem(COMPLETIONS_STORAGE_KEY),
      ]);

      const parsedProgress = safeJsonParse<WellnessProgress>(progressData);
      if (parsedProgress) {
        setProgress({
          ...{
            totalPoints: 0,
            dailyPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0,
            completedActivities: [],
            streak: 0,
            earnedBadges: [],
            unlockedRewards: [],
            spentPoints: 0,
          },
          ...parsedProgress,
          lastActivityDate: parsedProgress.lastActivityDate ? new Date(parsedProgress.lastActivityDate) : undefined,
        });
      }

      const parsedCompletions = safeJsonParse<any[]>(completionsData);
      if (Array.isArray(parsedCompletions)) {
        const formattedCompletions = parsedCompletions.map((completion: any) => ({
          ...completion,
          completedAt: new Date(completion.completedAt),
        }));
        setCompletions(formattedCompletions);
      }
    } catch (error) {
      console.error('Error loading wellness progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const persistProgress = useCallback(async (newProgress: WellnessProgress) => {
    const json = safeJsonStringify(newProgress);
    if (json) {
      await AsyncStorage.setItem(WELLNESS_STORAGE_KEY, json);
    }
  }, []);

  const persistCompletions = useCallback(async (newCompletions: ActivityCompletion[]) => {
    const json = safeJsonStringify(newCompletions);
    if (json) {
      await AsyncStorage.setItem(COMPLETIONS_STORAGE_KEY, json);
    }
  }, []);

  const getCurrentRiskLevel = useCallback((): RiskLevel => {
    const latestAssessment = getLatestAssessment();
    return latestAssessment?.result.category || 'minimal';
  }, [getLatestAssessment]);

  const getAvailableActivities = useCallback((): WellnessActivity[] => {
    const riskLevel = getCurrentRiskLevel();
    const activities = WELLNESS_ACTIVITIES[riskLevel] || WELLNESS_ACTIVITIES.minimal;
    
    const today = new Date().toDateString();
    const todayCompletions = completions.filter(c => 
      c.completedAt.toDateString() === today
    );

    return activities.map(activity => ({
      ...activity,
      completed: todayCompletions.some(c => c.activityId === activity.id),
      completedAt: todayCompletions.find(c => c.activityId === activity.id)?.completedAt,
    }));
  }, [getCurrentRiskLevel, completions]);

  const checkForNewBadges = useCallback((newProgress: WellnessProgress, newCompletions: ActivityCompletion[]): WellnessBadge[] => {
    if (!newProgress || !Array.isArray(newCompletions)) return [];
    
    const earnedBadgeIds = new Set(newProgress.earnedBadges);
    const newBadges: WellnessBadge[] = [];

    for (const badge of WELLNESS_BADGES) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let earned = false;
      switch (badge.requirement.type) {
        case 'streak':
          earned = newProgress.streak >= badge.requirement.value;
          break;
        case 'points':
          earned = newProgress.totalPoints >= badge.requirement.value;
          break;
        case 'activities':
          earned = newCompletions.length >= badge.requirement.value;
          break;
        case 'category':
          if (badge.requirement.category) {
            const categoryCount = newCompletions.filter(c => {
              const riskLevel = getCurrentRiskLevel();
              const activities = WELLNESS_ACTIVITIES[riskLevel] || WELLNESS_ACTIVITIES.minimal;
              const activity = activities.find(a => a.id === c.activityId);
              return activity?.category === badge.requirement.category;
            }).length;
            earned = categoryCount >= badge.requirement.value;
          }
          break;
        case 'days':
          const uniqueDays = [...new Set(newCompletions.map(c => c.completedAt.toDateString()))].length;
          earned = uniqueDays >= badge.requirement.value;
          break;
      }

      if (earned) {
        newBadges.push(badge);
      }
    }

    return newBadges;
  }, [getCurrentRiskLevel]);

  const completeActivity = useCallback(async (activityId: string, notes?: string) => {
    try {
      setIsLoading(true);
      const riskLevel = getCurrentRiskLevel();
      const activities = WELLNESS_ACTIVITIES[riskLevel] || WELLNESS_ACTIVITIES.minimal;
      const activity = activities.find(a => a.id === activityId);
      
      if (!activity) {
        throw new Error('Activity not found');
      }

      const now = new Date();
      const today = now.toDateString();
      
      // Check if already completed today
      const alreadyCompleted = completions.some(c => 
        c.activityId === activityId && c.completedAt.toDateString() === today
      );
      
      if (alreadyCompleted) {
        throw new Error('Activity already completed today');
      }

      const completion: ActivityCompletion = {
        activityId,
        completedAt: now,
        points: activity.points,
        notes,
      };

      const newCompletions = [completion, ...completions];
      setCompletions(newCompletions);
      await persistCompletions(newCompletions);

      // Update progress
      const todayCompletions = newCompletions.filter(c => 
        c.completedAt.toDateString() === today
      );
      const dailyPoints = todayCompletions.reduce((sum, c) => sum + c.points, 0);

      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());
      const weeklyCompletions = newCompletions.filter(c => c.completedAt >= thisWeekStart);
      const weeklyPoints = weeklyCompletions.reduce((sum, c) => sum + c.points, 0);

      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyCompletions = newCompletions.filter(c => c.completedAt >= thisMonthStart);
      const monthlyPoints = monthlyCompletions.reduce((sum, c) => sum + c.points, 0);

      // Calculate streak
      let streak = 0;
      const sortedDates = [...new Set(newCompletions.map(c => c.completedAt.toDateString()))].sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );
      
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date(now);
        expectedDate.setDate(now.getDate() - i);
        
        if (date.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      const newProgress: WellnessProgress = {
        totalPoints: progress.totalPoints + activity.points,
        dailyPoints,
        weeklyPoints,
        monthlyPoints,
        completedActivities: [...new Set([...progress.completedActivities, activityId])],
        streak,
        lastActivityDate: now,
        earnedBadges: progress.earnedBadges,
        unlockedRewards: progress.unlockedRewards,
        spentPoints: progress.spentPoints,
      };

      // Check for new badges
      const newBadges = checkForNewBadges(newProgress, newCompletions);
      if (newBadges.length > 0) {
        newProgress.earnedBadges = [...new Set([...newProgress.earnedBadges, ...newBadges.map(b => b.id)])];
        newProgress.totalPoints += newBadges.reduce((sum, badge) => sum + badge.points, 0);
      }

      setProgress(newProgress);
      await persistProgress(newProgress);

      return { 
        success: true, 
        points: activity.points, 
        newBadges: newBadges.length > 0 ? newBadges : undefined 
      };
    } catch (error) {
      console.error('Error completing activity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentRiskLevel, completions, progress, persistCompletions, persistProgress, checkForNewBadges]);

  const getCurrentTier = useCallback((): WellnessTier => {
    const totalPoints = progress.totalPoints;
    if (totalPoints >= TIER_THRESHOLDS.platinum) return 'platinum';
    if (totalPoints >= TIER_THRESHOLDS.gold) return 'gold';
    if (totalPoints >= TIER_THRESHOLDS.silver) return 'silver';
    return 'bronze';
  }, [progress.totalPoints]);



  const getStats = useCallback((): WellnessStats => {
    const categoryCount: Record<string, number> = {};
    completions.forEach(c => {
      const riskLevel = getCurrentRiskLevel();
      const activities = WELLNESS_ACTIVITIES[riskLevel] || WELLNESS_ACTIVITIES.minimal;
      const activity = activities.find(a => a.id === c.activityId);
      if (activity) {
        categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
      }
    });

    const favoriteCategory = Object.entries(categoryCount).reduce((a, b) => 
      categoryCount[a[0]] > categoryCount[b[0]] ? a : b, ['mood', 0]
    )[0];

    const currentLevel = LEVEL_THRESHOLDS.findIndex(threshold => 
      progress.totalPoints < threshold
    ) - 1;
    const actualLevel = Math.max(0, currentLevel);
    const nextLevelThreshold = LEVEL_THRESHOLDS[actualLevel + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const pointsToNextLevel = nextLevelThreshold - progress.totalPoints;

    const currentTier = getCurrentTier();
    const tierEntries = Object.entries(TIER_THRESHOLDS) as [WellnessTier, number][];
    const currentTierIndex = tierEntries.findIndex(([tier]) => tier === currentTier);
    const nextTierEntry = tierEntries[currentTierIndex + 1];
    const pointsToNextTier = nextTierEntry ? nextTierEntry[1] - progress.totalPoints : 0;

    const daysWithActivities = [...new Set(completions.map(c => c.completedAt.toDateString()))].length;
    const averageDailyPoints = daysWithActivities > 0 ? progress.totalPoints / daysWithActivities : 0;

    return {
      totalActivitiesCompleted: completions.length,
      favoriteCategory,
      averageDailyPoints: Math.round(averageDailyPoints),
      longestStreak: progress.streak,
      currentLevel: actualLevel,
      pointsToNextLevel: Math.max(0, pointsToNextLevel),
      currentTier,
      pointsToNextTier: Math.max(0, pointsToNextTier),
    };
  }, [completions, progress, getCurrentRiskLevel, getCurrentTier]);

  const getDailyQuote = useCallback((): string => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return WELLNESS_QUOTES[dayOfYear % WELLNESS_QUOTES.length];
  }, []);

  const getAvailableBadges = useCallback((): WellnessBadge[] => {
    return WELLNESS_BADGES.filter(badge => !progress.earnedBadges.includes(badge.id));
  }, [progress.earnedBadges]);

  const getEarnedBadges = useCallback((): WellnessBadge[] => {
    return WELLNESS_BADGES.filter(badge => progress.earnedBadges.includes(badge.id));
  }, [progress.earnedBadges]);

  const getAvailableRewards = useCallback((): WellnessReward[] => {
    const currentTier = getCurrentTier();
    const tierOrder: WellnessTier[] = ['bronze', 'silver', 'gold', 'platinum'];
    const currentTierIndex = tierOrder.indexOf(currentTier);
    
    return WELLNESS_REWARDS.filter(reward => {
      const rewardTierIndex = tierOrder.indexOf(reward.tier);
      return rewardTierIndex <= currentTierIndex && !progress.unlockedRewards.includes(reward.id);
    });
  }, [getCurrentTier, progress.unlockedRewards]);

  const getUnlockedRewards = useCallback((): WellnessReward[] => {
    return WELLNESS_REWARDS.filter(reward => progress.unlockedRewards.includes(reward.id));
  }, [progress.unlockedRewards]);

  const unlockReward = useCallback(async (rewardId: string) => {
    const reward = WELLNESS_REWARDS.find(r => r.id === rewardId);
    if (!reward) {
      throw new Error('Reward not found');
    }

    const availablePoints = progress.totalPoints - progress.spentPoints;
    if (availablePoints < reward.cost) {
      throw new Error('Insufficient points');
    }

    const currentTier = getCurrentTier();
    const tierOrder: WellnessTier[] = ['bronze', 'silver', 'gold', 'platinum'];
    const currentTierIndex = tierOrder.indexOf(currentTier);
    const rewardTierIndex = tierOrder.indexOf(reward.tier);
    
    if (rewardTierIndex > currentTierIndex) {
      throw new Error('Tier requirement not met');
    }

    const newProgress: WellnessProgress = {
      ...progress,
      unlockedRewards: [...progress.unlockedRewards, rewardId],
      spentPoints: progress.spentPoints + reward.cost,
    };

    setProgress(newProgress);
    await persistProgress(newProgress);

    return { success: true, reward };
  }, [progress, getCurrentTier, persistProgress]);

  const resetDailyProgress = useCallback(async () => {
    const newProgress: WellnessProgress = {
      ...progress,
      dailyPoints: 0,
    };
    setProgress(newProgress);
    await persistProgress(newProgress);
  }, [progress, persistProgress]);

  return useMemo(() => ({
    progress,
    completions,
    isLoading,
    getCurrentRiskLevel,
    getCurrentTier,
    getAvailableActivities,
    completeActivity,
    getStats,
    getDailyQuote,
    getAvailableBadges,
    getEarnedBadges,
    getAvailableRewards,
    getUnlockedRewards,
    unlockReward,
    resetDailyProgress,
    loadProgress,
  }), [
    progress,
    completions,
    isLoading,
    getCurrentRiskLevel,
    getCurrentTier,
    getAvailableActivities,
    completeActivity,
    getStats,
    getDailyQuote,
    getAvailableBadges,
    getEarnedBadges,
    getAvailableRewards,
    getUnlockedRewards,
    unlockReward,
    resetDailyProgress,
    loadProgress,
  ]);
});