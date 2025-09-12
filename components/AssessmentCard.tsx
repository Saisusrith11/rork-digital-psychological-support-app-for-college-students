import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ClipboardList, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { useAssessment } from '@/hooks/assessment-store';

export default function AssessmentCard() {
  const { getLatestAssessment } = useAssessment();
  const latestAssessment = getLatestAssessment();

  const handleStartAssessment = () => {
    router.push('/assessment');
  };

  const handleViewResults = () => {
    if (latestAssessment) {
      router.push(`/assessment-result?id=${latestAssessment.id}`);
    }
  };

  const daysSinceLastAssessment = latestAssessment 
    ? Math.floor((Date.now() - latestAssessment.completedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const shouldShowRetake = daysSinceLastAssessment === null || daysSinceLastAssessment >= 7;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <ClipboardList size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mental Health Check-in</Text>
          <Text style={styles.subtitle}>
            {latestAssessment 
              ? `Last completed ${daysSinceLastAssessment} days ago`
              : 'Take a quick assessment to understand your well-being'
            }
          </Text>
        </View>
      </View>

      {latestAssessment && !shouldShowRetake && (
        <TouchableOpacity style={styles.resultButton} onPress={handleViewResults}>
          <TrendingUp size={16} color={Colors.primary} />
          <Text style={styles.resultButtonText}>View Latest Results</Text>
        </TouchableOpacity>
      )}

      {shouldShowRetake && (
        <TouchableOpacity style={styles.assessmentButton} onPress={handleStartAssessment}>
          <Text style={styles.assessmentButtonText}>
            {latestAssessment ? 'Retake Assessment' : 'Start Assessment'}
          </Text>
        </TouchableOpacity>
      )}

      {latestAssessment && shouldShowRetake && (
        <TouchableOpacity style={styles.viewPreviousButton} onPress={handleViewResults}>
          <Text style={styles.viewPreviousText}>View Previous Results</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  resultButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  assessmentButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  assessmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  viewPreviousButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewPreviousText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
  },
});