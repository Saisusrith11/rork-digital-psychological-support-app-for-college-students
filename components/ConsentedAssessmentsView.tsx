import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Shield, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Eye, Clock, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { CounselorAssessmentView } from '@/types/assessment';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';

export default function ConsentedAssessmentsView() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  const assessmentsQuery = trpc.consent.getConsentedAssessments.useQuery(
    { counselorId: user?.id || 'counselor-1' },
    { enabled: !!user?.id }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await assessmentsQuery.refetch();
    setRefreshing(false);
  };

  const handleViewDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowDetailsModal(true);
  };

  const handleScheduleFollowUp = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowScheduleModal(true);
  };

  const scheduleAppointment = () => {
    Alert.alert(
      'Follow-up Scheduled',
      `Follow-up appointment has been scheduled for ${selectedAssessment?.anonymousCode}. The student will be notified.`,
      [{ text: 'OK', onPress: () => setShowScheduleModal(false) }]
    );
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'severe': return Colors.error;
      case 'moderate': return Colors.warning;
      case 'mild': return Colors.mood.okay;
      case 'minimal': return Colors.success;
      default: return Colors.text.secondary;
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'severe': return <AlertTriangle size={16} color={Colors.error} />;
      case 'moderate': return <TrendingUp size={16} color={Colors.warning} />;
      case 'mild': return <CheckCircle size={16} color={Colors.mood.okay} />;
      case 'minimal': return <CheckCircle size={16} color={Colors.success} />;
      default: return <Users size={16} color={Colors.text.secondary} />;
    }
  };

  if (assessmentsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Shield size={20} color={Colors.primary} />
          <Text style={styles.title}>Consented Student Assessments</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading assessments...</Text>
        </View>
      </View>
    );
  }

  if (assessmentsQuery.isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Shield size={20} color={Colors.primary} />
          <Text style={styles.title}>Consented Student Assessments</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load assessments</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => assessmentsQuery.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const assessments = assessmentsQuery.data?.assessments || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={20} color={Colors.primary} />
        <Text style={styles.title}>Consented Student Assessments</Text>
        <Text style={styles.subtitle}>
          {assessments.length} student{assessments.length !== 1 ? 's' : ''} shared their results
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {assessments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Shield size={48} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>No Consented Assessments</Text>
            <Text style={styles.emptyDescription}>
              Students who consent to share their assessment results will appear here.
              This ensures full privacy control for all students.
            </Text>
          </View>
        ) : (
          <View style={styles.assessmentsList}>
            {assessments.map((assessment) => (
              <View key={assessment.id} style={styles.assessmentCard}>
                <View style={styles.assessmentHeader}>
                  <View style={styles.studentInfo}>
                    <Users size={18} color={Colors.text.primary} />
                    <Text style={styles.studentCode}>{assessment.anonymousCode}</Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(assessment.category) + '20' }]}>
                    {getRiskIcon(assessment.category)}
                    <Text style={[styles.riskText, { color: getRiskColor(assessment.category) }]}>
                      {assessment.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.assessmentDetails}>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Assessment Score</Text>
                    <Text style={[styles.scoreValue, { color: getRiskColor(assessment.category) }]}>
                      {assessment.totalScore}/45
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Calendar size={14} color={Colors.text.secondary} />
                    <Text style={styles.detailText}>
                      Completed: {assessment.completedAt.toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.consentIndicator}>
                    <CheckCircle size={14} color={Colors.success} />
                    <Text style={styles.consentText}>
                      Student consented to share results
                    </Text>
                  </View>
                </View>

                <View style={styles.assessmentActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleScheduleFollowUp(assessment)}
                    testID={`schedule-followup-${assessment.id}`}
                  >
                    <Clock size={16} color={Colors.text.primary} />
                    <Text style={styles.actionButtonText}>Schedule Follow-up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={() => handleViewDetails(assessment)}
                    testID={`view-details-${assessment.id}`}
                  >
                    <Eye size={16} color={Colors.text.white} />
                    <Text style={styles.primaryActionText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assessment Details</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {selectedAssessment && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Student Information</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Anonymous Code:</Text>
                    <Text style={styles.detailValue}>{selectedAssessment.anonymousCode}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Risk Category:</Text>
                    <Text style={[styles.detailValue, { color: getRiskColor(selectedAssessment.category) }]}>
                      {selectedAssessment.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Assessment Results</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Total Score:</Text>
                    <Text style={styles.detailValue}>{selectedAssessment.totalScore}/45</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Completed Date:</Text>
                    <Text style={styles.detailValue}>
                      {selectedAssessment.completedAt.toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Recommendations</Text>
                  <Text style={styles.recommendationText}>
                    Based on the assessment results, consider scheduling regular follow-up sessions 
                    and providing appropriate mental health resources.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Schedule Follow-up Modal */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.scheduleModalContent}>
            <Text style={styles.modalTitle}>Schedule Follow-up</Text>
            <Text style={styles.modalMessage}>
              Schedule a follow-up appointment for {selectedAssessment?.anonymousCode}?
            </Text>
            <Text style={styles.modalSubtext}>
              The student will receive a notification about the scheduled appointment.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowScheduleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={scheduleAppointment}
              >
                <Text style={styles.confirmButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.text.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  assessmentsList: {
    padding: 16,
    gap: 16,
  },
  assessmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentCode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assessmentDetails: {
    marginBottom: 16,
    gap: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  consentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success + '10',
    padding: 8,
    borderRadius: 6,
  },
  consentText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  assessmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  primaryAction: {
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    fontSize: 14,
    color: Colors.text.white,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  scheduleModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 12,
    color: Colors.text.light,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});