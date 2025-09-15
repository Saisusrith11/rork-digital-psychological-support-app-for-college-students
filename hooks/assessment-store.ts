import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Assessment, AssessmentResponse, AssessmentResult } from '@/types/assessment';
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
      };

      const updatedAssessments = [newAssessment, ...assessments];
      setAssessments(updatedAssessments);
      
      const assessmentsJson = safeJsonStringify(updatedAssessments);
      if (assessmentsJson) {
        await AsyncStorage.setItem(ASSESSMENT_STORAGE_KEY, assessmentsJson);
      }
      
      return newAssessment;
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [assessments, user?.id]);

  const getLatestAssessment = useCallback(() => {
    return assessments.length > 0 ? assessments[0] : null;
  }, [assessments]);

  const getAssessmentHistory = useCallback(() => {
    return assessments;
  }, [assessments]);

  const submitConsent = useCallback(async (assessment: Assessment, consentGranted: boolean) => {
    try {
      setIsLoading(true);
      
      // Ensure we have a valid student ID
      const studentId = assessment.studentId || user?.id || `anonymous_${Date.now()}`;
      
      console.log('Submitting consent:', { 
        assessmentId: assessment.id, 
        consentGranted, 
        studentId,
        originalStudentId: assessment.studentId,
        currentUserId: user?.id
      });
      
      const result = await trpcClient.consent.submit.mutate({
        assessmentId: assessment.id,
        consentGranted,
        studentId,
      });
      console.log('Backend consent result:', result);

      // Update the assessment with consent status and ensure studentId is set
      const updatedAssessment: Assessment = {
        ...assessment,
        studentId, // Ensure studentId is always set
        consentStatus: consentGranted ? 'granted' : 'denied',
        consentTimestamp: new Date(),
      };
      console.log('Updated assessment:', updatedAssessment);

      // Update local storage
      const updatedAssessments = assessments.map(a => 
        a.id === assessment.id ? updatedAssessment : a
      );
      setAssessments(updatedAssessments);
      const assessmentsJson = safeJsonStringify(updatedAssessments);
      if (assessmentsJson) {
        await AsyncStorage.setItem(ASSESSMENT_STORAGE_KEY, assessmentsJson);
      }
      console.log('Assessments updated in storage');
      
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
  }, [assessments, user?.id]);

  const revokeConsent = useCallback(async (assessmentId: string) => {
    try {
      setIsLoading(true);
      
      const assessment = assessments.find(a => a.id === assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Use current user ID if assessment doesn't have studentId
      const studentId = assessment.studentId || user?.id || `anonymous_${Date.now()}`;
      
      if (!studentId || studentId.trim() === '') {
        throw new Error('Assessment not found or missing student ID');
      }
      
      console.log('Revoking consent for:', { assessmentId, studentId, assessment });

      await trpcClient.consent.revoke.mutate({
        assessmentId,
        studentId,
      });

      // Update local assessment with studentId to ensure consistency
      const updatedAssessments = assessments.map(a => 
        a.id === assessmentId 
          ? { ...a, studentId, consentStatus: 'denied' as const, consentTimestamp: new Date() }
          : a
      );
      setAssessments(updatedAssessments);
      const assessmentsJson = safeJsonStringify(updatedAssessments);
      if (assessmentsJson) {
        await AsyncStorage.setItem(ASSESSMENT_STORAGE_KEY, assessmentsJson);
      }
      
      return { success: true, message: 'Consent revoked successfully' };
    } catch (error) {
      console.error('Error revoking consent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [assessments, user?.id]);

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