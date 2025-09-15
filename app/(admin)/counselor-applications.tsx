import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Languages,
  Award,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  Bell,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { useNotifications } from '@/hooks/notification-store';
import type { CounselorApplication } from '@/types/user';
import { AlertModal } from '@/components/AlertModal';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function CounselorApplicationsAdmin() {
  const insets = useSafeAreaInsets();
  const { addNotification } = useNotifications();
  const [selectedApplication, setSelectedApplication] = useState<CounselorApplication | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [showFilters, setShowFilters] = useState<boolean>(false);
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

  // Queries
  const applicationsQuery = trpc.counselor.application.getAll.useQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery || undefined,
    limit: 50,
  });
  
  const statsQuery = trpc.counselor.application.getStats.useQuery();

  // Mutations
  const approveMutation = trpc.counselor.application.approve.useMutation({
    onSuccess: (data) => {
      console.log('[CounselorApplications] Application approved:', data.counselorEmail);
      
      // Add notification for successful approval
      addNotification({
        userId: 'admin',
        title: 'Application Approved',
        message: `Counselor application approved. Login credentials sent to ${data.counselorEmail}`,
        type: 'system',
        isRead: false,
      });
      
      setAlertModal({
        visible: true,
        title: 'Application Approved',
        message: data.message,
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
      
      setShowApplicationModal(false);
      setSelectedApplication(null);
      applicationsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      console.error('[CounselorApplications] Approval error:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to approve application',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    },
  });

  const rejectMutation = trpc.counselor.application.reject.useMutation({
    onSuccess: (data) => {
      console.log('[CounselorApplications] Application rejected:', data.counselorEmail);
      
      // Add notification for rejection
      addNotification({
        userId: 'admin',
        title: 'Application Rejected',
        message: `Counselor application rejected. Reason: ${data.rejectionReason}`,
        type: 'system',
        isRead: false,
      });
      
      setAlertModal({
        visible: true,
        title: 'Application Rejected',
        message: data.message,
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
      
      setShowRejectModal(false);
      setShowApplicationModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      applicationsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      console.error('[CounselorApplications] Rejection error:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to reject application',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    },
  });

  // Send immediate notification when new application is submitted
  useEffect(() => {
    if (statsQuery.data?.pending > 0) {
      // This would be triggered by a real-time system in production
      const hasNewApplications = statsQuery.data.pending > 0;
      if (hasNewApplications) {
        addNotification({
          userId: 'admin',
          title: 'New Counselor Application',
          message: `${statsQuery.data.pending} pending counselor application(s) require review`,
          type: 'system',
          isRead: false,
        });
      }
    }
  }, [statsQuery.data?.pending, addNotification]);

  const handleApprove = useCallback((application: CounselorApplication) => {
    setAlertModal({
      visible: true,
      title: 'Approve Application',
      message: `Are you sure you want to approve ${application.personalInfo.fullName}'s application? This will grant them access to the counselor portal and send them login credentials.`,
      type: 'info',
      buttons: [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            approveMutation.mutate({
              applicationId: application.id,
              adminNotes: 'Application approved after document review',
            });
          },
        },
      ],
    });
  }, [approveMutation]);

  const handleReject = useCallback(() => {
    if (!selectedApplication || !rejectionReason.trim()) {
      setAlertModal({
        visible: true,
        title: 'Missing Information',
        message: 'Please provide a reason for rejection.',
        type: 'warning',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
      return;
    }

    rejectMutation.mutate({
      applicationId: selectedApplication.id,
      rejectionReason: rejectionReason.trim(),
      adminNotes: 'Application rejected after review',
    });
  }, [selectedApplication, rejectionReason, rejectMutation]);

  const handleDownloadDocument = useCallback(async (document: any) => {
    try {
      console.log('[CounselorApplications] Downloading document:', document.fileName);
      
      if (Platform.OS === 'web') {
        // Web download
        const link = document.createElement('a');
        link.href = document.fileUrl;
        link.download = document.fileName;
        link.click();
      } else {
        // Mobile - open in browser or external app
        await Linking.openURL(document.fileUrl);
      }
    } catch (error) {
      console.error('[CounselorApplications] Download error:', error);
      setAlertModal({
        visible: true,
        title: 'Download Error',
        message: 'Failed to download document',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'approved':
        return Colors.success;
      case 'rejected':
        return Colors.error;
      default:
        return Colors.text.secondary;
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={Colors.warning} />;
      case 'approved':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'rejected':
        return <XCircle size={16} color={Colors.error} />;
      default:
        return <AlertTriangle size={16} color={Colors.text.secondary} />;
    }
  }, []);

  const filteredApplications = applicationsQuery.data?.applications || [];

  const renderApplicationCard = ({ item }: { item: CounselorApplication }) => (
    <TouchableOpacity
      style={styles.applicationCard}
      onPress={() => {
        setSelectedApplication(item);
        setShowApplicationModal(true);
      }}
      testID={`application-${item.id}`}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.applicationInfo}>
          <Text style={styles.applicationName}>{item.personalInfo.fullName}</Text>
          <Text style={styles.applicationEmail}>{item.personalInfo.email}</Text>
          <Text style={styles.applicationDate}>
            Submitted: {new Date(item.submittedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.applicationStatus}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.applicationDetails}>
        <Text style={styles.specializationText}>
          Specializations: {item.professionalInfo.specialization.slice(0, 2).join(', ')}
          {item.professionalInfo.specialization.length > 2 && ` +${item.professionalInfo.specialization.length - 2} more`}
        </Text>
        <Text style={styles.documentsText}>
          Documents: {item.documents.length} uploaded
        </Text>
      </View>
      
      {item.status === 'pending' && (
        <View style={styles.pendingBadge}>
          <Bell size={12} color={Colors.text.white} />
          <Text style={styles.pendingBadgeText}>Needs Review</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderApplicationModal = () => {
    if (!selectedApplication) return null;

    return (
      <Modal
        visible={showApplicationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApplicationModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity
              onPress={() => setShowApplicationModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name:</Text>
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Mail size={16} color={Colors.text.secondary} />
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={16} color={Colors.text.secondary} />
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={16} color={Colors.text.secondary} />
                <Text style={styles.infoValue}>{selectedApplication.personalInfo.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Calendar size={16} color={Colors.text.secondary} />
                <Text style={styles.infoValue}>DOB: {selectedApplication.personalInfo.dateOfBirth}</Text>
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
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Specializations:</Text>
                  <Text style={styles.infoValue}>
                    {selectedApplication.professionalInfo.specialization.join(', ')}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Languages size={16} color={Colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Languages:</Text>
                  <Text style={styles.infoValue}>
                    {selectedApplication.professionalInfo.languages.join(', ')}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Briefcase size={16} color={Colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Current Employment:</Text>
                  <Text style={styles.infoValue}>
                    {selectedApplication.professionalInfo.currentEmployment || 'Not specified'}
                  </Text>
                </View>
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
                <Text style={styles.sectionTitle}>Documents ({selectedApplication.documents.length})</Text>
              </View>
              {selectedApplication.documents.map((doc) => (
                <View key={doc.id} style={styles.documentRow}>
                  <View style={styles.documentInfo}>
                    <FileText size={16} color={Colors.text.secondary} />
                    <View style={styles.documentDetails}>
                      <Text style={styles.documentName}>{doc.fileName}</Text>
                      <Text style={styles.documentType}>
                        {doc.type.replace('_', ' ').toUpperCase()} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownloadDocument(doc)}
                    testID={`download-${doc.id}`}
                  >
                    <Download size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Application Status */}
            <View style={styles.section}>
              <View style={styles.statusSection}>
                <Text style={styles.sectionTitle}>Application Status</Text>
                <View style={styles.statusBadge}>
                  {getStatusIcon(selectedApplication.status)}
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(selectedApplication.status) }]}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.statusDate}>
                Submitted: {new Date(selectedApplication.submittedAt).toLocaleString()}
              </Text>
              {selectedApplication.reviewedAt && (
                <Text style={styles.statusDate}>
                  Reviewed: {new Date(selectedApplication.reviewedAt).toLocaleString()}
                </Text>
              )}
              {selectedApplication.rejectionReason && (
                <View style={styles.rejectionReasonSection}>
                  <Text style={styles.rejectionReasonLabel}>Rejection Reason:</Text>
                  <Text style={styles.rejectionReasonText}>{selectedApplication.rejectionReason}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {selectedApplication.status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => setShowRejectModal(true)}
                disabled={rejectMutation.isPending}
                testID="reject-button"
              >
                <XCircle size={20} color={Colors.text.white} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(selectedApplication)}
                disabled={approveMutation.isPending}
                testID="approve-button"
              >
                <CheckCircle size={20} color={Colors.text.white} />
                <Text style={styles.approveButtonText}>
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  const renderRejectModal = () => (
    <Modal
      visible={showRejectModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRejectModal(false)}
    >
      <View style={styles.rejectModalOverlay}>
        <View style={styles.rejectModalContent}>
          <Text style={styles.rejectModalTitle}>Reject Application</Text>
          <Text style={styles.rejectModalMessage}>
            Please provide a reason for rejecting {selectedApplication?.personalInfo.fullName}&apos;s application.
            This reason will be included in the rejection email.
          </Text>
          
          <TextInput
            style={styles.rejectionReasonInput}
            value={rejectionReason}
            onChangeText={setRejectionReason}
            placeholder="e.g., RCI registration number invalid, Missing degree certificate, Insufficient experience"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="rejection-reason-input"
          />
          
          <View style={styles.rejectModalButtons}>
            <TouchableOpacity
              style={[styles.rejectModalButton, styles.cancelButton]}
              onPress={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.rejectModalButton,
                styles.confirmRejectButton,
                (!rejectionReason.trim() || rejectMutation.isPending) && styles.buttonDisabled,
              ]}
              onPress={handleReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
              testID="confirm-reject-button"
            >
              <Text style={styles.confirmRejectButtonText}>
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="counselor-applications">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Counselor Applications</Text>
        <TouchableOpacity
          onPress={() => {
            applicationsQuery.refetch();
            statsQuery.refetch();
          }}
          style={styles.refreshButton}
          testID="refresh-button"
        >
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statsQuery.data?.pending || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statsQuery.data?.approved || 0}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statsQuery.data?.rejected || 0}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statsQuery.data?.total || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or email"
            testID="search-input"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          testID="filter-button"
        >
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      {showFilters && (
        <View style={styles.filterContainer}>
          {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterPill,
                filterStatus === status && styles.filterPillActive,
              ]}
              onPress={() => setFilterStatus(status)}
              testID={`filter-${status}`}
            >
              <Text style={[
                styles.filterPillText,
                filterStatus === status && styles.filterPillTextActive,
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Applications List */}
      {applicationsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : filteredApplications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={48} color={Colors.text.light} />
          <Text style={styles.emptyTitle}>No Applications Found</Text>
          <Text style={styles.emptyMessage}>
            {filterStatus === 'pending'
              ? 'No pending applications at the moment.'
              : `No ${filterStatus} applications found.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          renderItem={renderApplicationCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          testID="applications-list"
        />
      )}

      {renderApplicationModal()}
      {renderRejectModal()}
      
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: Colors.text.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  applicationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
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
  applicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  applicationEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  applicationDate: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 4,
  },
  applicationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  applicationDetails: {
    marginTop: 8,
  },
  specializationText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  documentsText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  pendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    color: Colors.text.white,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  infoContent: {
    flex: 1,
  },
  experienceSection: {
    marginTop: 8,
  },
  experienceText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginTop: 4,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  documentType: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  downloadButton: {
    padding: 8,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDate: {
    fontSize: 12,
    color: Colors.text.light,
    marginBottom: 4,
  },
  rejectionReasonSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.error,
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 14,
    color: Colors.error,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    gap: 8,
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
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  rejectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '85%',
  },
  rejectModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  rejectModalMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  rejectionReasonInput: {
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    minHeight: 80,
    marginBottom: 20,
  },
  rejectModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  confirmRejectButton: {
    backgroundColor: Colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  confirmRejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});