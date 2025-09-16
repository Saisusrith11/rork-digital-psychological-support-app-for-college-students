import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { WellnessProgress, WellnessStats, ActivityCompletion, WellnessActivity, RiskLevel } from '@/types/wellness';
import { WELLNESS_ACTIVITIES, LEVEL_THRESHOLDS, WELLNESS_QUOTES } from '@/constants/wellness-activities';
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
      };

      setProgress(newProgress);
      await persistProgress(newProgress);

      return { success: true, points: activity.points };
    } catch (error) {
      console.error('Error completing activity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentRiskLevel, completions, progress, persistCompletions, persistProgress]);

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

    const daysWithActivities = [...new Set(completions.map(c => c.completedAt.toDateString()))].length;
    const averageDailyPoints = daysWithActivities > 0 ? progress.totalPoints / daysWithActivities : 0;

    return {
      totalActivitiesCompleted: completions.length,
      favoriteCategory,
      averageDailyPoints: Math.round(averageDailyPoints),
      longestStreak: progress.streak, // This could be enhanced to track historical longest streak
      currentLevel: actualLevel,
      pointsToNextLevel: Math.max(0, pointsToNextLevel),
    };
  }, [completions, progress, getCurrentRiskLevel]);

  const getDailyQuote = useCallback((): string => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return WELLNESS_QUOTES[dayOfYear % WELLNESS_QUOTES.length];
  }, []);

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
    getAvailableActivities,
    completeActivity,
    getStats,
    getDailyQuote,
    resetDailyProgress,
    loadProgress,
  }), [
    progress,
    completions,
    isLoading,
    getCurrentRiskLevel,
    getAvailableActivities,
    completeActivity,
    getStats,
    getDailyQuote,
    resetDailyProgress,
    loadProgress,
  ]);
});