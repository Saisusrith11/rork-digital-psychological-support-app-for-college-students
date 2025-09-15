import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
} from 'react-native';
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Languages,
  Award,
  Clock,
  Search,
  Filter,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertModal } from '@/components/AlertModal';
import { trpc } from '@/lib/trpc';

interface CounselorApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
  };
  professionalInfo: {
    specialization: string[];
    experience: string;
    languages: string[];
    currentEmployment?: string;
  };
  documents: {
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function CounselorApplicationsAdmin() {
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedApplication, setSelectedApplication] = useState<CounselorApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>('');
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

  // tRPC queries and mutations
  const applicationsQuery = trpc.counselor.application.getAll.useQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery.trim() || undefined,
  });

  const approveApplicationMutation = trpc.counselor.application.approve.useMutation({
    onSuccess: () => {
      applicationsQuery.refetch();
      setShowDetailModal(false);
      setAlertModal({
        visible: true,
        title: 'Success',
        message: 'Application approved successfully. The counselor has been notified.',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    },
    onError: (error) => {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to approve application',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    },
  });

  const rejectApplicationMutation = trpc.counselor.application.reject.useMutation({
    onSuccess: () => {
      applicationsQuery.refetch();
      setShowDetailModal(false);
      setAlertModal({
        visible: true,
        title: 'Success',
        message: 'Application rejected. The counselor has been notified.',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    },
    onError: (error) => {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to reject application',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    },
  });

  const handleViewApplication = useCallback((application: CounselorApplication) => {
    if (!application?.id?.trim() || application.id.length > 100) return;
    setSelectedApplication(application);
    setAdminNotes(application.adminNotes || '');
    setShowDetailModal(true);
  }, []);

  const handleApproveApplication = useCallback(() => {
    if (!selectedApplication) return;

    setAlertModal({
      visible: true,
      title: 'Approve Application',
      message: `Are you sure you want to approve ${selectedApplication.personalInfo.fullName}'s application? This will grant them access to the counselor platform.`,
      type: 'warning',
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: () => {
            if (!selectedApplication.id?.trim() || selectedApplication.id.length > 100) return;
            if (adminNotes && adminNotes.length > 1000) return;
            
            approveApplicationMutation.mutate({
              applicationId: selectedApplication.id,
              adminNotes: adminNotes.trim(),
            });
          },
          style: 'default',
        },
      ],
    });
  }, [selectedApplication, adminNotes, approveApplicationMutation]);

  const handleRejectApplication = useCallback(() => {
    if (!selectedApplication) return;

    setAlertModal({
      visible: true,
      title: 'Reject Application',
      message: `Are you sure you want to reject ${selectedApplication.personalInfo.fullName}'s application? This action cannot be undone.`,
      type: 'warning',
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Reject',
          onPress: () => {
            if (!selectedApplication.id?.trim() || selectedApplication.id.length > 100) return;
            if (adminNotes && adminNotes.length > 1000) return;
            
            rejectApplicationMutation.mutate({
              applicationId: selectedApplication.id,
              adminNotes: adminNotes.trim(),
            });
          },
          style: 'destructive',
        },
      ],
    });
  }, [selectedApplication, adminNotes, rejectApplicationMutation]);

  const handleDownloadDocument = useCallback(async (fileUrl: string, fileName: string) => {
    try {
      if (!fileUrl?.trim() || fileUrl.length > 2000) return;
      if (!fileName?.trim() || fileName.length > 255) return;
      
      const sanitizedUrl = fileUrl.trim();
      const canOpen = await Linking.canOpenURL(sanitizedUrl);
      
      if (canOpen) {
        await Linking.openURL(sanitizedUrl);
      } else {
        setAlertModal({
          visible: true,
          title: 'Error',
          message: 'Unable to open document',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => {} }],
        });
      }
    } catch (error) {
      console.error('[CounselorApplicationsAdmin] Download error:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Failed to download document',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  }, []);

  const getStatusColor = (status: string) => {
    if (!status?.trim() || status.length > 20) return Colors.warning;
    const sanitizedStatus = status.trim();
    
    switch (sanitizedStatus) {
      case 'approved':
        return Colors.success;
      case 'rejected':
        return Colors.error;
      case 'pending':
      default:
        return Colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'rejected':
        return <XCircle size={16} color={Colors.error} />;
      case 'pending':
      default:
        return <Clock size={16} color={Colors.warning} />;
    }
  };

  const filteredApplications = applicationsQuery.data?.applications || [];

  const renderApplicationCard = (application: CounselorApplication) => {
    if (!application?.id?.trim()) return null;
    
    return (
      <TouchableOpacity
        key={application.id}
        style={styles.applicationCard}
        onPress={() => {
          if (!application?.id?.trim() || application.id.length > 100) return;
          handleViewApplication(application);
        }}
        testID={`application-${application.id}`}
      >
      <View style={styles.applicationHeader}>
        <View style={styles.applicationInfo}>
          <Text style={styles.applicantName}>{application.personalInfo.fullName}</Text>
          <Text style={styles.applicantEmail}>{application.personalInfo.email}</Text>
          <Text style={styles.submissionDate}>
            Submitted: {new Date(application.submittedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
            {getStatusIcon(application.status)}
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.applicationPreview}>
        <Text style={styles.previewLabel}>Specializations:</Text>
        <Text style={styles.previewText} numberOfLines={2}>
          {application.professionalInfo.specialization.join(', ')}
        </Text>
        
        <Text style={styles.previewLabel}>Languages:</Text>
        <Text style={styles.previewText} numberOfLines={1}>
          {application.professionalInfo.languages.join(', ')}
        </Text>
        
        <Text style={styles.previewLabel}>Documents:</Text>
        <Text style={styles.previewText}>
          {application.documents.length} document(s) uploaded
        </Text>
      </View>
      
      <View style={styles.applicationActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            if (!application?.id?.trim() || application.id.length > 100) return;
            handleViewApplication(application);
          }}
          testID={`view-${application.id}`}
        >
          <Eye size={16} color={Colors.primary} />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedApplication) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={styles.closeButton}
              testID="close-modal"
            >
              <XCircle size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <View style={styles.infoRow}>
                <User size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Full Name:</Text>
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.fullName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Mail size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Phone size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.phone}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <MapPin size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.address}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Calendar size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.dateOfBirth}</Text>
              </View>
            </View>
            
            {/* Professional Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Briefcase size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Professional Information</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Award size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Specializations:</Text>
                <Text style={styles.infoValue}>
                  {selectedApplication.professionalInfo.specialization.join(', ')}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Languages size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Languages:</Text>
                <Text style={styles.infoValue}>
                  {selectedApplication.professionalInfo.languages.join(', ')}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Briefcase size={16} color={Colors.text.secondary} />
                <Text style={styles.infoLabel}>Current Employment:</Text>
                <Text style={styles.infoValue}>
                  {selectedApplication.professionalInfo.currentEmployment || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.experienceSection}>
                <Text style={styles.infoLabel}>Experience:</Text>
                <Text style={styles.experienceText}>
                  {selectedApplication.professionalInfo.experience}
                </Text>
              </View>
            </View>
            
            {/* Documents */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Documents</Text>
              </View>
              
              {selectedApplication.documents.map((doc) => (
                <View key={`${doc.type}-${doc.fileName}`} style={styles.documentRow}>
                  <FileText size={16} color={Colors.text.secondary} />
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.fileName}</Text>
                    <Text style={styles.documentType}>{doc.type.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDownloadDocument(doc.fileUrl, doc.fileName)}
                    style={styles.downloadButton}
                    testID={`download-${doc.type}`}
                  >
                    <Download size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Admin Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Admin Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={adminNotes}
                onChangeText={setAdminNotes}
                placeholder="Add notes about this application..."
                multiline
                numberOfLines={4}
                testID="admin-notes"
              />
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          {selectedApplication.status === 'pending' && (
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleRejectApplication}
                disabled={rejectApplicationMutation.isPending}
                testID="reject-button"
              >
                <XCircle size={20} color={Colors.text.white} />
                <Text style={styles.rejectButtonText}>
                  {rejectApplicationMutation.isPending ? 'Rejecting...' : 'Reject'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={handleApproveApplication}
                disabled={approveApplicationMutation.isPending}
                testID="approve-button"
              >
                <CheckCircle size={20} color={Colors.text.white} />
                <Text style={styles.approveButtonText}>
                  {approveApplicationMutation.isPending ? 'Approving...' : 'Approve'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="counselor-applications-admin">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Counselor Applications</Text>
      </View>
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or email..."
            testID="search-input"
          />
        </View>
        
        <View style={styles.filterContainer}>
          <Filter size={16} color={Colors.text.secondary} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => {
              if (!status?.trim() || status.length > 20) return null;
              const sanitizedStatus = status.trim();
              
              return (
                <TouchableOpacity
                  key={sanitizedStatus}
                  style={[
                    styles.filterChip,
                    filterStatus === sanitizedStatus && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterStatus(sanitizedStatus as FilterStatus)}
                  testID={`filter-${sanitizedStatus}`}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterStatus === sanitizedStatus && styles.filterChipTextActive,
                  ]}>
                    {sanitizedStatus.charAt(0).toUpperCase() + sanitizedStatus.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
      
      {/* Applications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {applicationsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading applications...</Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>No Applications Found</Text>
            <Text style={styles.emptyDescription}>
              {filterStatus === 'all'
                ? 'No counselor applications have been submitted yet.'
                : `No ${filterStatus} applications found.`}
            </Text>
          </View>
        ) : (
          filteredApplications.map(renderApplicationCard)
        )}
      </ScrollView>
      
      {/* Detail Modal */}
      {showDetailModal && renderDetailModal()}
      
      {/* Alert Modal */}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    marginLeft: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.text.white,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
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
  applicationCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  applicantEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    color: Colors.text.light,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  applicationPreview: {
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 2,
  },
  previewText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 600,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: 8,
    minWidth: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  experienceSection: {
    marginTop: 8,
  },
  experienceText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginTop: 4,
    padding: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 8,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  documentType: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  downloadButton: {
    padding: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginLeft: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginLeft: 8,
  },
});