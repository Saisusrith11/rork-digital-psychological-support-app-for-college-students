import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Assessment, AssessmentResponse, AssessmentResult, AssessmentSyncItem } from '@/types/assessment';
import { getAssessmentResult } from '@/constants/assessment-questions';
import { trpcClient } from '@/lib/trpc';
import { useAuth } from './auth-store';
import { safeJsonParse, safeJsonStringify } from '@/utils/safe-json-parse';

const ASSESSMENT_STORAGE_KEY = 'assessments';

export const [AssessmentProvider, useAssessment] = createContextHook(() => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pendingConsent, setPendingConsent] = useState<Assessment | null>(null);

  const loadAssessments = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(ASSESSMENT_STORAGE_KEY);
      const parsedData = safeJsonParse<any[]>(stored);
      if (Array.isArray(parsedData)) {
        const parsedAssessments = parsedData.map((assessment: any) => ({
          ...assessment,
          completedAt: new Date(assessment.completedAt),
          result: {
            ...assessment.result,
            completedAt: new Date(assessment.result.completedAt),
          },
        }));
        setAssessments(parsedAssessments);
      } else {
        setAssessments([]);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const persist = useCallback(async (items: Assessment[]) => {
    const json = safeJsonStringify(items);
    if (json) {
      await AsyncStorage.setItem(ASSESSMENT_STORAGE_KEY, json);
    }
  }, []);

  const saveAssessment = useCallback(async (responses: AssessmentResponse[]) => {
    try {
      setIsLoading(true);
      
      const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
      const resultData = getAssessmentResult(totalScore, responses);
      
      const result: AssessmentResult = {
        totalScore,
        category: resultData.category,
        recommendations: resultData.recommendations,
        completedAt: new Date(),
      };

      const newAssessment: Assessment = {
        id: Date.now().toString(),
        responses,
        result,
        completedAt: new Date(),
        consentStatus: 'pending',
        studentId: user?.id || `anonymous_${Date.now()}`,
        anonymousCode: `AN-${Math.floor(Math.random() * 9000) + 1000}`,
        synced: false,
      };

      const updatedAssessments = [newAssessment, ...assessments];
      setAssessments(updatedAssessments);
      await persist(updatedAssessments);
      
      return newAssessment;
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [assessments, user?.id, persist]);

  const syncPending = useCallback(async () => {
    try {
      const pending = assessments.filter(a => !a.synced);
      if (pending.length === 0) return { synced: 0 };
      const payload: AssessmentSyncItem[] = pending.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        totalScore: a.result.totalScore,
        category: a.result.category,
        completedAt: a.completedAt.toISOString(),
      }));
      const res = await trpcClient.assessments.sync.mutate({ items: payload });
      if (res?.success && Array.isArray(res.syncedIds)) {
        const updated = assessments.map(a => res.syncedIds.includes(a.id) ? { ...a, synced: true } : a);
        setAssessments(updated);
        await persist(updated);
        return { synced: res.syncedIds.length };
      }
      return { synced: 0 };
    } catch (e) {
      console.log('[assessment-store] syncPending failed', e);
      return { synced: 0 };
    }
  }, [assessments, persist]);

  useEffect(() => {
    let timer: any;
    const start = () => {
      timer = setInterval(() => {
        syncPending();
      }, 15000);
    };
    start();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [syncPending]);

  const getLatestAssessment = useCallback(() => {
    return assessments.length > 0 ? assessments[0] : null;
  }, [assessments]);

  const getAssessmentHistory = useCallback(() => {
    return assessments;
  }, [assessments]);

  const submitConsent = useCallback(async (assessment: Assessment, consentGranted: boolean) => {
    try {
      setIsLoading(true);
      
      const studentId = assessment.studentId || user?.id || `anonymous_${Date.now()}`;
      
      const result = await trpcClient.consent.submit.mutate({
        assessmentId: assessment.id,
        consentGranted,
        studentId,
      });

      const updatedAssessment: Assessment = {
        ...assessment,
        studentId,
        consentStatus: consentGranted ? 'granted' : 'denied',
        consentTimestamp: new Date(),
      };

      const updatedAssessments = assessments.map(a => 
        a.id === assessment.id ? updatedAssessment : a
      );
      setAssessments(updatedAssessments);
      await persist(updatedAssessments);
      
      setPendingConsent(null);
      
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error('Error submitting consent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [assessments, user?.id, persist]);

  const revokeConsent = useCallback(async (assessmentId: string) => {
    try {
      setIsLoading(true);
      
      const assessment = assessments.find(a => a.id === assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const studentId = assessment.studentId || user?.id || `anonymous_${Date.now()}`;
      
      if (!studentId || studentId.trim() === '') {
        throw new Error('Assessment not found or missing student ID');
      }
      
      await trpcClient.consent.revoke.mutate({
        assessmentId,
        studentId,
      });

      const updatedAssessments = assessments.map(a => 
        a.id === assessmentId 
          ? { ...a, studentId, consentStatus: 'denied' as const, consentTimestamp: new Date() }
          : a
      );
      setAssessments(updatedAssessments);
      await persist(updatedAssessments);
      
      return { success: true, message: 'Consent revoked successfully' };
    } catch (error) {
      console.error('Error revoking consent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [assessments, user?.id, persist]);

  const setPendingConsentAssessment = useCallback((assessment: Assessment | null) => {
    setPendingConsent(assessment);
  }, []);

  return useMemo(() => ({
    assessments,
    isLoading,
    pendingConsent,
    loadAssessments,
    saveAssessment,
    getLatestAssessment,
    getAssessmentHistory,
    submitConsent,
    revokeConsent,
    setPendingConsentAssessment,
  }), [assessments, isLoading, pendingConsent, loadAssessments, saveAssessment, getLatestAssessment, getAssessmentHistory, submitConsent, revokeConsent, setPendingConsentAssessment]);
});