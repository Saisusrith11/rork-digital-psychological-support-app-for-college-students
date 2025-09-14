import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Shield, CheckCircle, X, AlertCircle, Users } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Assessment } from '@/types/assessment';

interface ConsentScreenProps {
  visible: boolean;
  assessment: Assessment | null;
  onConsentDecision: (granted: boolean) => void;
  onClose: () => void;
}

export default function ConsentScreen({
  visible,
  assessment,
  onConsentDecision,
  onClose,
}: ConsentScreenProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleConsentDecision = async (granted: boolean) => {
    setIsProcessing(true);
    try {
      await onConsentDecision(granted);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!assessment) return null;

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'severe': return Colors.error;
      case 'moderate': return Colors.warning;
      case 'mild': return Colors.mood.okay;
      case 'minimal': return Colors.success;
      default: return Colors.text.secondary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Shield size={32} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Share Your Results?</Text>
              <Text style={styles.subtitle}>
                Do you want to share your assessment results with a counselor for professional help?
              </Text>
            </View>

            {/* Assessment Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Your Assessment Summary</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={[styles.scoreValue, { color: getRiskColor(assessment.result.category) }]}>
                  {assessment.result.totalScore}/45
                </Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(assessment.result.category) + '20' }]}>
                <Text style={[styles.categoryText, { color: getRiskColor(assessment.result.category) }]}>
                  {assessment.result.category.toUpperCase()} CONCERN LEVEL
                </Text>
              </View>
            </View>

            {/* Privacy Information */}
            <View style={styles.privacySection}>
              <View style={styles.privacyHeader}>
                <AlertCircle size={20} color={Colors.primary} />
                <Text style={styles.privacyTitle}>Privacy & Data Control</Text>
              </View>
              
              <View style={styles.privacyItem}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.privacyText}>
                  You maintain full control over your data
                </Text>
              </View>
              
              <View style={styles.privacyItem}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.privacyText}>
                  Only assigned counselors can view consented data
                </Text>
              </View>
              
              <View style={styles.privacyItem}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.privacyText}>
                  You can revoke consent at any time
                </Text>
              </View>
            </View>

            {/* Options Explanation */}
            <View style={styles.optionsSection}>
              <Text style={styles.optionsTitle}>Your Options:</Text>
              
              <View style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <Users size={20} color={Colors.primary} />
                  <Text style={styles.optionTitle}>✅ Yes, Share with Counselor</Text>
                </View>
                <Text style={styles.optionDescription}>
                  • Your results will be visible to assigned counselors
                  • Enables professional follow-up and support
                  • Counselor can schedule sessions and provide guidance
                  • Data remains confidential within the counseling team
                </Text>
              </View>
              
              <View style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <Shield size={20} color={Colors.text.secondary} />
                  <Text style={styles.optionTitle}>❌ No, Keep Private</Text>
                </View>
                <Text style={styles.optionDescription}>
                  • Results remain visible only to you
                  • No counselor notifications or follow-ups
                  • You can still access all self-help resources
                  • You can change this decision later
                </Text>
              </View>
            </View>

            {/* Important Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteTitle}>Important:</Text>
              <Text style={styles.noteText}>
                Regardless of your choice, you always have access to crisis support, 
                self-help resources, and can book appointments directly when needed.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.denyButton]}
              onPress={() => handleConsentDecision(false)}
              disabled={isProcessing}
              testID="consent-deny-button"
            >
              <X size={20} color={Colors.text.primary} />
              <Text style={[styles.buttonText, styles.denyButtonText]}>
                {isProcessing ? 'Processing...' : 'Keep Private'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.grantButton]}
              onPress={() => handleConsentDecision(true)}
              disabled={isProcessing}
              testID="consent-grant-button"
            >
              <CheckCircle size={20} color={Colors.text.white} />
              <Text style={[styles.buttonText, styles.grantButtonText]}>
                {isProcessing ? 'Processing...' : 'Share with Counselor'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  privacySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  optionsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  noteContainer: {
    padding: 20,
    backgroundColor: Colors.primaryLight + '10',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  denyButton: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.text.light,
  },
  grantButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  denyButtonText: {
    color: Colors.text.primary,
  },
  grantButtonText: {
    color: Colors.text.white,
  },
});