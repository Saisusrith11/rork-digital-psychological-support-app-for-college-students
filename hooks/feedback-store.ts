import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Feedback } from '@/types/user';

export const [FeedbackProvider, useFeedback] = createContextHook(() => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedbacks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('feedbacks');
      if (stored) {
        const parsedFeedbacks = JSON.parse(stored);
        setFeedbacks(parsedFeedbacks);
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
      await AsyncStorage.setItem('feedbacks', JSON.stringify(newFeedbacks));
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

  return {
    feedbacks,
    isLoading,
    pendingCount,
    submitFeedback,
    updateFeedbackStatus,
  };
});