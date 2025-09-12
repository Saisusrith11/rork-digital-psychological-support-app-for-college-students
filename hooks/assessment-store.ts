import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Assessment, AssessmentResponse, AssessmentResult } from '@/types/assessment';
import { getAssessmentResult } from '@/constants/assessment-questions';

const ASSESSMENT_STORAGE_KEY = 'assessments';

export const [AssessmentProvider, useAssessment] = createContextHook(() => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadAssessments = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(ASSESSMENT_STORAGE_KEY);
      if (stored && stored.trim() && stored !== 'undefined' && stored !== 'null') {
        try {
          const parsedData = JSON.parse(stored);
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
          }
        } catch (parseError) {
          console.error('Error parsing assessments:', parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem(ASSESSMENT_STORAGE_KEY);
          setAssessments([]);
        }
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
      };

      const updatedAssessments = [newAssessment, ...assessments];
      setAssessments(updatedAssessments);
      
      await AsyncStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(updatedAssessments));
      
      return newAssessment;
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [assessments]);

  const getLatestAssessment = useCallback(() => {
    return assessments.length > 0 ? assessments[0] : null;
  }, [assessments]);

  const getAssessmentHistory = useCallback(() => {
    return assessments;
  }, [assessments]);

  return useMemo(() => ({
    assessments,
    isLoading,
    loadAssessments,
    saveAssessment,
    getLatestAssessment,
    getAssessmentHistory,
  }), [assessments, isLoading, loadAssessments, saveAssessment, getLatestAssessment, getAssessmentHistory]);
});