import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  BackHandler,
} from 'react-native';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  Shield,
  X,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import type { CounselorDocument } from '@/types/user';
import * as DocumentPicker from 'expo-document-picker';
import { AlertModal } from '@/components/AlertModal';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
}

interface ProfessionalInfo {
  specialization: string[];
  experience: string;
  languages: string[];
  currentEmployment: string;
}

interface DocumentUpload {
  type: CounselorDocument['type'];
  title: string;
  description: string;
  required: boolean;
  uploaded?: CounselorDocument;
}

const DOCUMENT_TYPES: DocumentUpload[] = [
  {
    type: 'degree_certificate',
    title: 'Master\'s Degree Certificate',
    description: 'Upload your Master\'s degree certificate in Psychology or related field',
    required: true,
  },
  {
    type: 'transcripts',
    title: 'Academic Transcripts',
    description: 'Upload your academic transcripts/mark sheets',
    required: true,
  },
  {
    type: 'rci_registration',
    title: 'RCI Registration Certificate',
    description: 'Rehabilitation Council of India registration (if applicable)',
    required: false,
  },
  {
    type: 'professional_registration',
    title: 'Professional Body Registration',
    description: 'Registration with professional bodies (e.g., Indian Association for Counselling)',
    required: false,
  },
  {
    type: 'experience_letter',
    title: 'Experience Letters',
    description: 'Employment/experience letters from previous positions',
    required: true,
  },
  {
    type: 'training_certificate',
    title: 'Training Certificates',
    description: 'Specialized training certificates (CBT, DBT, etc.)',
    required: false,
  },
  {
    type: 'government_id',
    title: 'Government ID',
    description: 'Aadhaar Card or PAN Card for identity verification',
    required: true,
  },
  {
    type: 'cv',
    title: 'Curriculum Vitae',
    description: 'Your updated CV/Resume',
    required: true,
  },
  {
    type: 'reference_contact',
    title: 'Professional References',
    description: 'Contact information for at least two professional references',
    required: true,
  },
];

const SPECIALIZATIONS = [
  'Anxiety Disorders',
  'Depression',
  'Stress Management',
  'Academic Counseling',
  'Career Counseling',
  'Relationship Counseling',
  'Trauma Therapy',
  'Cognitive Behavioral Therapy (CBT)',
  'Dialectical Behavior Therapy (DBT)',
  'Mindfulness-Based Therapy',
  'Family Therapy',
  'Group Therapy',
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Urdu',
  'Odia',
];

export default function CounselorApplicationForm() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    specialization: [],
    experience: '',
    languages: [],
    currentEmployment: '',
  });
  const [documents, setDocuments] = useState<DocumentUpload[]>(DOCUMENT_TYPES);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    buttons: {
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[];
  }>({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const uploadDocumentMutation = trpc.counselor.application.uploadDocument.useMutation();
  const submitApplicationMutation = trpc.counselor.application.submit.useMutation();

  const handleDocumentUpload = useCallback(async (documentType: CounselorDocument['type']) => {
    try {
      if (!documentType?.trim()) return;
      if (documentType.length > 100) return;
      const sanitizedType = documentType.trim();
      
      console.log('[CounselorApplication] Uploading document:', sanitizedType);

      if (Platform.OS === 'web') {
        // Web file upload
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) return;

          if (file.size > 5 * 1024 * 1024) {
            setAlertModal({
              visible: true,
              title: 'Error',
              message: 'File size must be less than 5MB',
              type: 'error',
              buttons: [{ text: 'OK', onPress: () => {} }],
            });
            return;
          }

          const reader = new FileReader();
          reader.onload = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            
            try {
              const result = await uploadDocumentMutation.mutateAsync({
                type: sanitizedType as CounselorDocument['type'],
                fileName: file.name,
                fileData: base64Data,
                mimeType: file.type,
              });

              if (result.success) {
                setDocuments(prev => prev.map(doc => 
                  doc.type === sanitizedType 
                    ? { ...doc, uploaded: result.document }
                    : doc
                ));
                setAlertModal({
                  visible: true,
                  title: 'Success',
                  message: 'Document uploaded successfully',
                  type: 'success',
                  buttons: [{ text: 'OK', onPress: () => {} }],
                });
              }
            } catch (error) {
              console.error('[CounselorApplication] Upload error:', error);
              setAlertModal({
                visible: true,
                title: 'Error',
                message: 'Failed to upload document',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }],
              });
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      } else {
        // Mobile file upload
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets[0]) {
          const file = result.assets[0];
          
          if (file.size && file.size > 5 * 1024 * 1024) {
            setAlertModal({
              visible: true,
              title: 'Error',
              message: 'File size must be less than 5MB',
              type: 'error',
              buttons: [{ text: 'OK', onPress: () => {} }],
            });
            return;
          }

          // Read file as base64
          const response = await fetch(file.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          
          reader.onload = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            
            try {
              const uploadResult = await uploadDocumentMutation.mutateAsync({
                type: sanitizedType as CounselorDocument['type'],
                fileName: file.name,
                fileData: base64Data,
                mimeType: file.mimeType || 'application/octet-stream',
              });

              if (uploadResult.success) {
                setDocuments(prev => prev.map(doc => 
                  doc.type === sanitizedType 
                    ? { ...doc, uploaded: uploadResult.document }
                    : doc
                ));
                setAlertModal({
                  visible: true,
                  title: 'Success',
                  message: 'Document uploaded successfully',
                  type: 'success',
                  buttons: [{ text: 'OK', onPress: () => {} }],
                });
              }
            } catch (error) {
              console.error('[CounselorApplication] Upload error:', error);
              setAlertModal({
                visible: true,
                title: 'Error',
                message: 'Failed to upload document',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }],
              });
            }
          };
          
          reader.readAsDataURL(blob);
        }
      }
    } catch (error) {
      console.error('[CounselorApplication] Document upload error:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Failed to upload document',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  }, [uploadDocumentMutation]);

  const handleSpecializationToggle = useCallback((specialization: string) => {
    if (!specialization?.trim()) return;
    if (specialization.length > 100) return;
    const sanitized = specialization.trim();
    
    setProfessionalInfo(prev => ({
      ...prev,
      specialization: prev.specialization.includes(sanitized)
        ? prev.specialization.filter(s => s !== sanitized)
        : [...prev.specialization, sanitized],
    }));
  }, []);

  const handleLanguageToggle = useCallback((language: string) => {
    if (!language?.trim()) return;
    if (language.length > 50) return;
    const sanitized = language.trim();
    
    setProfessionalInfo(prev => ({
      ...prev,
      languages: prev.languages.includes(sanitized)
        ? prev.languages.filter(l => l !== sanitized)
        : [...prev.languages, sanitized],
    }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          personalInfo.fullName.trim() &&
          personalInfo.email.trim() &&
          personalInfo.phone.trim() &&
          personalInfo.address.trim() &&
          personalInfo.dateOfBirth.trim()
        );
      case 2:
        return !!(
          professionalInfo.specialization.length > 0 &&
          professionalInfo.experience.trim() &&
          professionalInfo.languages.length > 0
        );
      case 3:
        const requiredDocs = documents.filter(doc => doc.required);
        const uploadedRequiredDocs = requiredDocs.filter(doc => doc.uploaded);
        return uploadedRequiredDocs.length >= requiredDocs.length;
      case 4:
        return termsAccepted && privacyAccepted;
      default:
        return false;
    }
  }, [personalInfo, professionalInfo, documents, termsAccepted, privacyAccepted]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      setAlertModal({
        visible: true,
        title: 'Incomplete',
        message: 'Please fill in all required fields before proceeding.',
        type: 'warning',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(4)) {
      setAlertModal({
        visible: true,
        title: 'Incomplete',
        message: 'Please complete all steps and accept the terms.',
        type: 'warning',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[CounselorApplication] Submitting application');

      const uploadedDocuments = documents
        .filter(doc => doc.uploaded)
        .map(doc => ({
          type: doc.type,
          fileName: doc.uploaded!.fileName,
          fileUrl: doc.uploaded!.fileUrl,
          fileSize: doc.uploaded!.fileSize,
          mimeType: doc.uploaded!.mimeType,
        }));

      const result = await submitApplicationMutation.mutateAsync({
        personalInfo,
        professionalInfo,
        documents: uploadedDocuments,
        termsAccepted,
        privacyAccepted,
      });

      if (result.success) {
        setAlertModal({
          visible: true,
          title: 'Application Submitted',
          message: result.message,
          type: 'success',
          buttons: [{
            text: 'OK',
            onPress: () => router.replace('/auth'),
          }],
        });
      }
    } catch (error) {
      console.error('[CounselorApplication] Submit error:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to submit application',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateStep,
    personalInfo,
    professionalInfo,
    documents,
    termsAccepted,
    privacyAccepted,
    submitApplicationMutation,
  ]);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive,
            currentStep > step && styles.stepCircleCompleted,
          ]}>
            {currentStep > step ? (
              <CheckCircle size={16} color={Colors.text.white} />
            ) : (
              <Text style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}>
                {step}
              </Text>
            )}
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineCompleted,
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <User size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Personal Information</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={personalInfo.fullName}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, fullName: text }))}
          placeholder="Enter your full name"
          testID="input-fullname"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.textInput}
          value={personalInfo.email}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, email: text }))}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          testID="input-email"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.textInput}
          value={personalInfo.phone}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phone: text }))}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          testID="input-phone"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={personalInfo.address}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, address: text }))}
          placeholder="Enter your complete address"
          multiline
          numberOfLines={3}
          testID="input-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <TextInput
          style={styles.textInput}
          value={personalInfo.dateOfBirth}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: text }))}
          placeholder="DD/MM/YYYY"
          testID="input-dob"
        />
      </View>
    </View>
  );

  const renderProfessionalInfoStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Briefcase size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Professional Information</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Specializations * (Select at least one)</Text>
        <View style={styles.chipContainer}>
          {SPECIALIZATIONS.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[
                styles.chip,
                professionalInfo.specialization.includes(spec) && styles.chipSelected,
              ]}
              onPress={() => handleSpecializationToggle(spec)}
              testID={`chip-specialization-${spec}`}
            >
              <Text style={[
                styles.chipText,
                professionalInfo.specialization.includes(spec) && styles.chipTextSelected,
              ]}>
                {spec}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Experience *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={professionalInfo.experience}
          onChangeText={(text) => setProfessionalInfo(prev => ({ ...prev, experience: text }))}
          placeholder="Describe your professional experience in counseling/psychology"
          multiline
          numberOfLines={4}
          testID="input-experience"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Languages * (Select at least one)</Text>
        <View style={styles.chipContainer}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.chip,
                professionalInfo.languages.includes(lang) && styles.chipSelected,
              ]}
              onPress={() => handleLanguageToggle(lang)}
              testID={`chip-language-${lang}`}
            >
              <Text style={[
                styles.chipText,
                professionalInfo.languages.includes(lang) && styles.chipTextSelected,
              ]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Employment (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={professionalInfo.currentEmployment}
          onChangeText={(text) => setProfessionalInfo(prev => ({ ...prev, currentEmployment: text }))}
          placeholder="Current workplace or position"
          testID="input-employment"
        />
      </View>
    </View>
  );

  const renderDocumentsStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <FileText size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Document Upload</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Please upload the following documents. Required documents are marked with *.
      </Text>

      {documents.map((doc) => (
        <View key={doc.type} style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>
                {doc.title} {doc.required && '*'}
              </Text>
              <Text style={styles.documentDescription}>{doc.description}</Text>
            </View>
            <View style={styles.documentStatus}>
              {doc.uploaded ? (
                <CheckCircle size={24} color={Colors.success} />
              ) : (
                <AlertCircle size={24} color={doc.required ? Colors.error : Colors.text.light} />
              )}
            </View>
          </View>
          
          {doc.uploaded ? (
            <View style={styles.uploadedFile}>
              <FileText size={16} color={Colors.success} />
              <Text style={styles.uploadedFileName}>{doc.uploaded.fileName}</Text>
              <TouchableOpacity
                onPress={() => setDocuments(prev => prev.map(d => 
                  d.type === doc.type ? { ...d, uploaded: undefined } : d
                ))}
                style={styles.removeButton}
              >
                <X size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleDocumentUpload(doc.type)}
              testID={`upload-${doc.type}`}
            >
              <Upload size={20} color={Colors.primary} />
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Shield size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Review & Submit</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Personal Information</Text>
        <Text style={styles.reviewText}>Name: {personalInfo.fullName}</Text>
        <Text style={styles.reviewText}>Email: {personalInfo.email}</Text>
        <Text style={styles.reviewText}>Phone: {personalInfo.phone}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Professional Information</Text>
        <Text style={styles.reviewText}>
          Specializations: {professionalInfo.specialization.join(', ')}
        </Text>
        <Text style={styles.reviewText}>
          Languages: {professionalInfo.languages.join(', ')}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Documents</Text>
        {documents.filter(doc => doc.uploaded).map((doc) => (
          <Text key={doc.type} style={styles.reviewText}>
            ✓ {doc.title}
          </Text>
        ))}
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setTermsAccepted(!termsAccepted)}
          testID="checkbox-terms"
        >
          <View style={[styles.checkboxBox, termsAccepted && styles.checkboxBoxChecked]}>
            {termsAccepted && <CheckCircle size={16} color={Colors.text.white} />}
          </View>
          <Text style={styles.checkboxText}>
            I agree to the Terms of Service and Privacy Policy *
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setPrivacyAccepted(!privacyAccepted)}
          testID="checkbox-privacy"
        >
          <View style={[styles.checkboxBox, privacyAccepted && styles.checkboxBoxChecked]}>
            {privacyAccepted && <CheckCircle size={16} color={Colors.text.white} />}
          </View>
          <Text style={styles.checkboxText}>
            I consent to the processing of my personal data for application review *
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderProfessionalInfoStep();
      case 3:
        return renderDocumentsStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      try {
        router.replace('/auth');
      } catch (e) {
        console.log('[CounselorApplication] back press error', e);
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      sub.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="counselor-application">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/auth')}
          style={styles.backButton}
          testID="back-button"
        >
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Counselor Application</Text>
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handlePrevious}
            testID="button-previous"
          >
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < 4 ? (
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              !validateStep(currentStep) && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!validateStep(currentStep)}
            testID="button-next"
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              (!validateStep(4) || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!validateStep(4) || isSubmitting}
            testID="button-submit"
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttons={alertModal.buttons}
        onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  stepNumberActive: {
    color: Colors.text.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.surfaceLight,
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.text.white,
  },
  documentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  documentStatus: {
    marginLeft: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  uploadedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.success + '20',
    borderRadius: 8,
  },
  uploadedFileName: {
    flex: 1,
    fontSize: 14,
    color: Colors.success,
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceLight,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
});