import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Calendar, TrendingUp, Heart, MessageCircle, BookOpen, RefreshCw, Shield, Users, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Assessment } from '@/types/assessment';
import { useAssessment } from '@/hooks/assessment-store';

export default function AssessmentResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAssessmentHistory, revokeConsent } = useAssessment();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isRevokingConsent, setIsRevokingConsent] = useState<boolean>(false);

  useEffect(() => {
    const assessments = getAssessmentHistory();
    let foundAssessment;
    
    if (id) {
      foundAssessment = assessments.find(a => a.id === id);
    } else {
      // If no ID provided, get the latest assessment
      foundAssessment = assessments.length > 0 ? assessments[0] : null;
    }
    
    if (foundAssessment) {
      setAssessment(foundAssessment);
    }
  }, [id, getAssessmentHistory]);

  const handleRevokeConsent = useCallback(async () => {
    if (!assessment) return;
    
    const performRevoke = async () => {
      try {
        setIsRevokingConsent(true);
        await revokeConsent(assessment.id);
        
        // Update local state
        setAssessment(prev => prev ? {
          ...prev,
          consentStatus: 'denied',
          consentTimestamp: new Date(),
        } : null);
        
        if (Platform.OS !== 'web') {
          Alert.alert('Success', 'Consent has been revoked. Your data is now private.');
        } else {
          console.log('Consent has been revoked. Your data is now private.');
        }
      } catch (error) {
        console.error('Error revoking consent:', error);
        if (Platform.OS !== 'web') {
          Alert.alert('Error', 'Failed to revoke consent. Please try again.');
        } else {
          console.error('Failed to revoke consent. Please try again.');
        }
      } finally {
        setIsRevokingConsent(false);
      }
    };
    
    const confirmRevoke = () => {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Revoke Consent',
          'Are you sure you want to revoke consent? Your assessment data will no longer be visible to counselors.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Revoke', style: 'destructive', onPress: performRevoke },
          ]
        );
      } else {
        const confirmed = confirm('Are you sure you want to revoke consent? Your assessment data will no longer be visible to counselors.');
        if (confirmed) {
          performRevoke();
        }
      }
    };
    
    confirmRevoke();
  }, [assessment, revokeConsent]);

  if (!assessment) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Assessment Results',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Assessment not found</Text>
        </View>
      </View>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'minimal': return Colors.success;
      case 'mild': return Colors.mood.okay;
      case 'moderate': return Colors.warning;
      case 'severe': return Colors.error;
      default: return Colors.text.secondary;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'minimal': return 'Your responses suggest you\'re managing well overall.';
      case 'mild': return 'You may be experiencing some stress or mild concerns.';
      case 'moderate': return 'Your responses indicate moderate stress or mental health concerns.';
      case 'severe': return 'Your responses suggest significant mental health concerns that warrant attention.';
      default: return '';
    }
  };

  const getConsentStatusColor = (status?: string) => {
    switch (status) {
      case 'granted': return Colors.success;
      case 'denied': return Colors.text.secondary;
      case 'pending': return Colors.warning;
      default: return Colors.text.light;
    }
  };

  const getConsentStatusText = (status?: string) => {
    switch (status) {
      case 'granted': return 'Shared with Counselors';
      case 'denied': return 'Private (Not Shared)';
      case 'pending': return 'Consent Pending';
      default: return 'Unknown Status';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Assessment Results',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultHeader}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={[styles.scoreValue, { color: getCategoryColor(assessment.result.category) }]}>
              {assessment.result.totalScore}/45
            </Text>
          </View>
          
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(assessment.result.category) + '20' }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor(assessment.result.category) }]}>
              {assessment.result.category.toUpperCase()} CONCERN LEVEL
            </Text>
          </View>
          
          <Text style={styles.categoryDescription}>
            {getCategoryDescription(assessment.result.category)}
          </Text>
          
          <View style={styles.dateContainer}>
            <Calendar size={16} color={Colors.text.secondary} />
            <Text style={styles.dateText}>
              Completed on {assessment.completedAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Consent Status Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Data Privacy Status</Text>
          </View>
          
          <View style={styles.consentStatusContainer}>
            <View style={[styles.consentStatusBadge, { backgroundColor: getConsentStatusColor(assessment.consentStatus) + '20' }]}>
              <Text style={[styles.consentStatusText, { color: getConsentStatusColor(assessment.consentStatus) }]}>
                {getConsentStatusText(assessment.consentStatus)}
              </Text>
            </View>
            
            {assessment.consentStatus === 'granted' && (
              <View style={styles.consentInfo}>
                <Users size={16} color={Colors.success} />
                <Text style={styles.consentInfoText}>
                  Your results are visible to assigned counselors for professional support.
                </Text>
              </View>
            )}
            
            {assessment.consentStatus === 'denied' && (
              <View style={styles.consentInfo}>
                <X size={16} color={Colors.text.secondary} />
                <Text style={styles.consentInfoText}>
                  Your results are private and not shared with counselors.
                </Text>
              </View>
            )}
            
            {assessment.consentTimestamp && (
              <Text style={styles.consentTimestamp}>
                Status updated: {assessment.consentTimestamp.toLocaleString()}
              </Text>
            )}
            
            {assessment.consentStatus === 'granted' && (
              <TouchableOpacity
                style={styles.revokeButton}
                onPress={handleRevokeConsent}
                disabled={isRevokingConsent}
              >
                <X size={16} color={Colors.error} />
                <Text style={styles.revokeButtonText}>
                  {isRevokingConsent ? 'Revoking...' : 'Revoke Consent'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
          </View>
          
          <View style={styles.recommendationsContainer}>
            {assessment.result.recommendations.map((recommendation, index) => (
              <View key={`rec-${index}`} style={styles.recommendationItem}>
                <View style={styles.recommendationBullet} />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Next Steps</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={() => router.push('/assessment')}
            >
              <RefreshCw size={24} color={Colors.primary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Retake Assessment</Text>
                <Text style={styles.actionDescription}>Take the assessment again to track your progress</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <MessageCircle size={24} color={Colors.primary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Talk to AI Assistant</Text>
                <Text style={styles.actionDescription}>Get immediate support and coping strategies</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/resources')}
            >
              <BookOpen size={24} color={Colors.primary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Explore Resources</Text>
                <Text style={styles.actionDescription}>Access guided exercises and educational content</Text>
              </View>
            </TouchableOpacity>
            
            {(assessment.result.category === 'moderate' || assessment.result.category === 'severe') && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.priorityAction]}
                onPress={() => router.push('/booking')}
              >
                <Calendar size={24} color={Colors.text.white} />
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, styles.priorityActionText]}>Book Counseling</Text>
                  <Text style={[styles.actionDescription, styles.priorityActionText]}>
                    Schedule a session with a professional counselor
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.disclaimerTitle}>Important Note</Text>
          <Text style={styles.disclaimerText}>
            This assessment is a screening tool and not a diagnostic instrument. 
            If you're experiencing persistent distress or thoughts of self-harm, 
            please seek immediate professional help or contact emergency services.
          </Text>
        </View>
      </ScrollView>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryDescription: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  section: {
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  priorityAction: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  priorityActionText: {
    color: Colors.text.white,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '15',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  consentStatusContainer: {
    gap: 12,
  },
  consentStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  consentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  consentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  consentInfoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  consentTimestamp: {
    fontSize: 12,
    color: Colors.text.light,
    fontStyle: 'italic',
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '10',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  revokeButtonText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
});