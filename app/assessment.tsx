import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ChevronLeft, CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { ASSESSMENT_QUESTIONS } from '@/constants/assessment-questions';
import { AssessmentResponse } from '@/types/assessment';
import { useAssessment } from '@/hooks/assessment-store';
import ConsentScreen from '@/components/ConsentScreen';

export default function AssessmentScreen() {
  const [showIntroduction, setShowIntroduction] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { saveAssessment, submitConsent, pendingConsent, setPendingConsentAssessment } = useAssessment();

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleOptionSelect = useCallback((optionValue: string, score: number) => {
    const newResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      selectedValue: optionValue,
      score,
    };

    const updatedResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    updatedResponses.push(newResponse);
    setResponses(updatedResponses);
  }, [currentQuestion.id, responses]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(async () => {
    if (responses.length !== ASSESSMENT_QUESTIONS.length) {
      if (Platform.OS !== 'web') {
        Alert.alert('Incomplete Assessment', 'Please answer all questions before submitting.');
      } else {
        console.log('Incomplete Assessment: Please answer all questions before submitting.');
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const savedAssessment = await saveAssessment(responses);
      
      // Show consent screen instead of immediately going to results
      setPendingConsentAssessment(savedAssessment);
    } catch (error) {
      console.error('Assessment save error:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to save assessment. Please try again.');
      } else {
        console.error('Failed to save assessment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [responses, saveAssessment, setPendingConsentAssessment]);

  const handleConsentDecision = useCallback(async (consentGranted: boolean) => {
    if (!pendingConsent) return;
    
    try {
      const result = await submitConsent(pendingConsent, consentGranted);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Assessment Complete',
          result.message,
          [
            {
              text: 'View Results',
              onPress: () => router.push(`/assessment-result?id=${pendingConsent.id}` as any),
            },
          ]
        );
      } else {
        console.log(result.message);
        router.push(`/assessment-result?id=${pendingConsent.id}` as any);
      }
    } catch (error) {
      console.error('Consent submission error:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to process consent. Please try again.');
      } else {
        console.error('Failed to process consent. Please try again.');
      }
    }
  }, [pendingConsent, submitConsent]);

  const handleConsentClose = useCallback(() => {
    setPendingConsentAssessment(null);
    // Navigate to results anyway
    if (pendingConsent) {
      router.push(`/assessment-result?id=${pendingConsent.id}` as any);
    }
  }, [pendingConsent, setPendingConsentAssessment]);

  const getCurrentResponse = useCallback(() => {
    return responses.find(r => r.questionId === currentQuestion.id);
  }, [responses, currentQuestion.id]);

  const canProceed = getCurrentResponse() !== undefined;

  const handleStartAssessment = () => {
    setShowIntroduction(false);
  };

  if (showIntroduction) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Mental Health Assessment',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>Mental Health Check-In</Text>
            <Text style={styles.introDescription}>
              The following questions ask about how often you have been bothered by any of the following problems over the last two weeks.
            </Text>
            <Text style={styles.introNote}>
              This assessment is based on standardized clinical screening tools (PHQ-9, GAD-7, and GHQ-12) and will help us understand your current mental health status.
            </Text>
            <Text style={styles.privacyNote}>
              🔒 Your responses are completely confidential and will only be used to provide you with personalized recommendations and support.
            </Text>
            
            <View style={styles.optionsInfo}>
              <Text style={styles.optionsTitle}>Response Options:</Text>
              <Text style={styles.optionItem}>• Not at all (0 points)</Text>
              <Text style={styles.optionItem}>• Several days (1 point)</Text>
              <Text style={styles.optionItem}>• More than half the days (2 points)</Text>
              <Text style={styles.optionItem}>• Nearly every day (3 points)</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleStartAssessment}
          >
            <Text style={[styles.navButtonText, styles.nextButtonText]}>
              Start Assessment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Mental Health Assessment',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => {
              const isSelected = getCurrentResponse()?.selectedValue === option.value;
              
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.optionButton, isSelected && styles.selectedOption]}
                  onPress={() => handleOptionSelect(option.value, option.score)}
                  testID={`option-${option.value}`}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <CheckCircle size={20} color={Colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.previousButton]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentQuestionIndex === 0 && styles.disabledButtonText
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !canProceed && styles.disabledButton]}
          onPress={isLastQuestion ? handleSubmit : handleNext}
          disabled={!canProceed || isSubmitting}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Consent Screen */}
      <ConsentScreen
        visible={!!pendingConsent}
        assessment={pendingConsent}
        onConsentDecision={handleConsentDecision}
        onClose={handleConsentClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionContainer: {
    paddingVertical: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 28,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: Colors.surfaceLight,
  },
  nextButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.surfaceLight,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: Colors.text.white,
  },
  disabledButtonText: {
    color: Colors.text.light,
  },
  introContainer: {
    paddingVertical: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 20,
  },
  introNote: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  privacyNote: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
    marginBottom: 24,
    backgroundColor: Colors.primaryLight + '20',
    padding: 12,
    borderRadius: 8,
  },
  optionsInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  optionItem: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
});