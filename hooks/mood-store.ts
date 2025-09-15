import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { MoodEntry } from '@/types/user';
import { safeJsonParse, safeJsonStringify } from '@/utils/safe-json-parse';

export const [MoodProvider, useMood] = createContextHook(() => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadMoodEntries = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const entries = await AsyncStorage.getItem(`mood_entries_${currentUserId}`);
      const parsedEntries = safeJsonParse<MoodEntry[]>(entries);
      if (Array.isArray(parsedEntries)) {
        setMoodEntries(parsedEntries);
        
        // Check if there's an entry for today
        const today = new Date().toDateString();
        const todayEntry = parsedEntries.find((entry: MoodEntry) => 
          new Date(entry.date).toDateString() === today
        );
        setTodaysMood(todayEntry || null);
      } else {
        setMoodEntries([]);
        setTodaysMood(null);
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      loadMoodEntries();
    }
  }, [currentUserId, loadMoodEntries]);



  const addMoodEntry = useCallback(async (mood: MoodEntry['mood'], notes?: string) => {
    if (!currentUserId) return;

    try {
      const today = new Date().toDateString();
      const existingEntryIndex = moodEntries.findIndex(entry => 
        new Date(entry.date).toDateString() === today
      );

      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        userId: currentUserId,
        mood,
        date: new Date().toISOString(),
        notes,
      };

      let updatedEntries;
      if (existingEntryIndex >= 0) {
        // Update existing entry
        updatedEntries = [...moodEntries];
        updatedEntries[existingEntryIndex] = newEntry;
      } else {
        // Add new entry
        updatedEntries = [...moodEntries, newEntry];
      }

      const entriesJson = safeJsonStringify(updatedEntries);
      if (entriesJson) {
        await AsyncStorage.setItem(`mood_entries_${currentUserId}`, entriesJson);
      }
      setMoodEntries(updatedEntries);
      setTodaysMood(newEntry);
    } catch (error) {
      console.error('Error adding mood entry:', error);
    }
  }, [currentUserId, moodEntries]);

  const setUserId = useCallback((userId: string | null) => {
    setCurrentUserId(userId);
    if (!userId) {
      setMoodEntries([]);
      setTodaysMood(null);
    }
  }, []);

  const getWeeklyMoodData = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return moodEntries.filter(entry => 
      new Date(entry.date) >= weekAgo && new Date(entry.date) <= now
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [moodEntries]);

  const getMoodAnalytics = useCallback(() => {
    const weeklyData = getWeeklyMoodData();
    
    if (weeklyData.length === 0) {
      return {
        averageMood: 0,
        moodTrend: 'stable' as const,
        totalEntries: 0,
        moodDistribution: {},
        weeklyData: [],
      };
    }

    const moodValues = {
      'great': 5,
      'good': 4,
      'okay': 3,
      'low': 2,
      'hard': 1,
    };

    const moodCounts = weeklyData.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageMood = weeklyData.reduce((sum, entry) => 
      sum + moodValues[entry.mood], 0
    ) / weeklyData.length;

    // Calculate trend (comparing first half vs second half of week)
    const midPoint = Math.floor(weeklyData.length / 2);
    const firstHalf = weeklyData.slice(0, midPoint);
    const secondHalf = weeklyData.slice(midPoint);
    
    let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstHalfAvg = firstHalf.reduce((sum, entry) => 
        sum + moodValues[entry.mood], 0
      ) / firstHalf.length;
      
      const secondHalfAvg = secondHalf.reduce((sum, entry) => 
        sum + moodValues[entry.mood], 0
      ) / secondHalf.length;
      
      const difference = secondHalfAvg - firstHalfAvg;
      
      if (difference > 0.3) {
        moodTrend = 'improving';
      } else if (difference < -0.3) {
        moodTrend = 'declining';
      }
    }

    return {
      averageMood,
      moodTrend,
      totalEntries: weeklyData.length,
      moodDistribution: moodCounts,
      weeklyData,
    };
  }, [getWeeklyMoodData]);

  return useMemo(() => ({
    moodEntries,
    todaysMood,
    addMoodEntry,
    getWeeklyMoodData,
    getMoodAnalytics,
    setUserId,
  }), [moodEntries, todaysMood, addMoodEntry, getWeeklyMoodData, getMoodAnalytics, setUserId]);
});