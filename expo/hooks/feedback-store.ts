import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Feedback } from '@/types/user';
import { safeJsonParse, safeJsonStringify } from '@/utils/safe-json-parse';

export const [FeedbackProvider, useFeedback] = createContextHook(() => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedbacks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('feedbacks');
      const parsedFeedbacks = safeJsonParse<Feedback[]>(stored);
      if (Array.isArray(parsedFeedbacks)) {
        setFeedbacks(parsedFeedbacks);
      } else {
        setFeedbacks([]);
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const saveFeedbacks = useCallback(async (newFeedbacks: Feedback[]) => {
    try {
      const feedbacksJson = safeJsonStringify(newFeedbacks);
      if (feedbacksJson) {
        await AsyncStorage.setItem('feedbacks', feedbacksJson);
      }
    } catch (error) {
      console.error('Error saving feedbacks:', error);
    }
  }, []);

  const submitFeedback = useCallback((feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    
    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    saveFeedbacks(updated);
  }, [feedbacks, saveFeedbacks]);

  const updateFeedbackStatus = useCallback((feedbackId: string, status: Feedback['status'], adminResponse?: string) => {
    const updated = feedbacks.map(feedback =>
      feedback.id === feedbackId
        ? { 
            ...feedback, 
            status, 
            adminResponse,
            respondedAt: adminResponse ? new Date().toISOString() : feedback.respondedAt
          }
        : feedback
    );
    setFeedbacks(updated);
    saveFeedbacks(updated);
  }, [feedbacks, saveFeedbacks]);

  const pendingCount = useMemo(() => {
    return feedbacks.filter(feedback => feedback.status === 'pending').length;
  }, [feedbacks]);

  return useMemo(() => ({
    feedbacks,
    isLoading,
    pendingCount,
    submitFeedback,
    updateFeedbackStatus,
  }), [feedbacks, isLoading, pendingCount, submitFeedback, updateFeedbackStatus]);
});