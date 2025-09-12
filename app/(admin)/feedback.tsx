import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
  Modal
} from 'react-native';
import { 
  MessageSquare, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Send
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useFeedback } from '@/hooks/feedback-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminFeedback() {
  const { feedbacks, updateFeedbackStatus } = useFeedback();
  const insets = useSafeAreaInsets();
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);

  const handleRespond = (feedback: any) => {
    setSelectedFeedback(feedback);
    setResponseText('');
    setShowResponseModal(true);
  };

  const submitResponse = () => {
    if (selectedFeedback && responseText.trim()) {
      updateFeedbackStatus(selectedFeedback.id, 'resolved', responseText.trim());
      setShowResponseModal(false);
      setSelectedFeedback(null);
      setResponseText('');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug':
        return Colors.error;
      case 'feature':
        return Colors.primary;
      case 'complaint':
        return Colors.warning;
      default:
        return Colors.success;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'reviewed':
        return <Clock size={16} color={Colors.warning} />;
      default:
        return <AlertCircle size={16} color={Colors.error} />;
    }
  };

  const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending');
  const reviewedFeedbacks = feedbacks.filter(f => f.status === 'reviewed');
  const resolvedFeedbacks = feedbacks.filter(f => f.status === 'resolved');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Feedback Management</Text>
        <Text style={styles.subtitle}>Review and respond to user feedback</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: Colors.error }]}>
              {pendingFeedbacks.length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: Colors.warning }]}>
              {reviewedFeedbacks.length}
            </Text>
            <Text style={styles.summaryLabel}>In Review</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: Colors.success }]}>
              {resolvedFeedbacks.length}
            </Text>
            <Text style={styles.summaryLabel}>Resolved</Text>
          </View>
        </View>

        {/* Pending Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Pending Feedback ({pendingFeedbacks.length})
          </Text>
          
          {pendingFeedbacks.map((feedback) => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.userInfo}>
                  <User size={16} color={Colors.text.secondary} />
                  <Text style={styles.userName}>{feedback.userName}</Text>
                </View>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(feedback.category) + '20' }
                ]}>
                  <Text style={[
                    styles.categoryText,
                    { color: getCategoryColor(feedback.category) }
                  ]}>
                    {feedback.category}
                  </Text>
                </View>
              </View>

              <Text style={styles.feedbackMessage}>{feedback.message}</Text>

              {feedback.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Rating: </Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        color={star <= feedback.rating! ? Colors.warning : Colors.surfaceLight}
                        fill={star <= feedback.rating! ? Colors.warning : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.feedbackFooter}>
                <Text style={styles.feedbackTime}>
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.feedbackActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                  >
                    <Text style={styles.actionButtonText}>Mark Reviewed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={() => handleRespond(feedback)}
                  >
                    <Text style={styles.primaryActionText}>Respond</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {pendingFeedbacks.length === 0 && (
            <View style={styles.emptyState}>
              <MessageSquare size={48} color={Colors.text.light} />
              <Text style={styles.emptyStateText}>No pending feedback</Text>
            </View>
          )}
        </View>

        {/* Recent Resolved Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Resolved</Text>
          
          {resolvedFeedbacks.slice(0, 3).map((feedback) => (
            <View key={feedback.id} style={styles.resolvedCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.userInfo}>
                  <User size={16} color={Colors.text.secondary} />
                  <Text style={styles.userName}>{feedback.userName}</Text>
                </View>
                <View style={styles.statusBadge}>
                  {getStatusIcon(feedback.status)}
                  <Text style={styles.statusText}>Resolved</Text>
                </View>
              </View>

              <Text style={styles.feedbackMessage} numberOfLines={2}>
                {feedback.message}
              </Text>

              {feedback.adminResponse && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Admin Response:</Text>
                  <Text style={styles.responseText}>{feedback.adminResponse}</Text>
                </View>
              )}

              <Text style={styles.feedbackTime}>
                Resolved on {new Date(feedback.respondedAt || feedback.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResponseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Respond to Feedback</Text>
            
            {selectedFeedback && (
              <View style={styles.originalFeedback}>
                <Text style={styles.originalFeedbackLabel}>Original Message:</Text>
                <Text style={styles.originalFeedbackText}>
                  {selectedFeedback.message}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.responseInput}
              placeholder="Type your response..."
              placeholderTextColor={Colors.text.light}
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowResponseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.sendButton]} 
                onPress={submitResponse}
                disabled={!responseText.trim()}
              >
                <Send size={16} color={Colors.text.white} />
                <Text style={styles.sendButtonText}>Send Response</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  feedbackCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  resolvedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    opacity: 0.8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  feedbackMessage: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 12,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackTime: {
    fontSize: 12,
    color: Colors.text.light,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  primaryAction: {
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    fontSize: 12,
    color: Colors.text.white,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  originalFeedback: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  originalFeedbackLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  originalFeedbackText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    minHeight: 100,
    marginBottom: 16,
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
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    gap: 6,
  },
  sendButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});