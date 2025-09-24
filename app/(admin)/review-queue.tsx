import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import {
  FileText,

  CheckCircle,
  XCircle,
  AlertTriangle,
  Bug,
  Lightbulb,
  MessageSquare,
  Shield,
  MoreHorizontal,
  Filter,
  X,
  Send,
  Paperclip,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { Stack } from 'expo-router';

type FilterOptions = {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  category: 'all' | 'bug' | 'feature' | 'feedback' | 'safety' | 'other';
  priority: 'all' | 'low' | 'medium' | 'high' | 'critical';
};

export default function AdminReviewQueue() {
  const insets = useSafeAreaInsets();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [adminComments, setAdminComments] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    priority: 'all'
  });

  const reportsQuery = trpc.reports.getAll.useQuery({ ...filters });
  const reportStatsQuery = trpc.reports.getStats.useQuery();
  const selectedReportQuery = trpc.reports.getById.useQuery({
    reportId: selectedReport!,
  }, {
    enabled: !!selectedReport
  });
  
  const reviewMutation = trpc.reports.review.useMutation({
    onSuccess: () => {
      setShowReviewModal(false);
      setSelectedReport(null);
      setAdminComments('');
      setReviewAction(null);
      reportsQuery.refetch();
      reportStatsQuery.refetch();
    },
    onError: (error: any) => {
      console.error('Review error:', error.message);
    }
  });

  const pendingReports = useMemo(() => {
    return reportsQuery.data?.reports?.filter((report: any) => report.status === 'pending') || [];
  }, [reportsQuery.data]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <Bug size={16} color={Colors.error} />;
      case 'feature': return <Lightbulb size={16} color={Colors.primary} />;
      case 'feedback': return <MessageSquare size={16} color={Colors.secondary} />;
      case 'safety': return <Shield size={16} color={Colors.warning} />;
      default: return <MoreHorizontal size={16} color={Colors.text.secondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return Colors.error;
      case 'high': return Colors.warning;
      case 'medium': return Colors.primary;
      case 'low': return Colors.success;
      default: return Colors.text.secondary;
    }
  };

  const handleReview = () => {
    if (!selectedReport || !reviewAction) return;
    
    (reviewMutation.mutate as any)({
      reportId: selectedReport,
      action: reviewAction,
      notes: adminComments.trim() || undefined
    });
  };

  const openReviewModal = (reportId: string, action: 'approve' | 'reject') => {
    if (!reportId.trim() || reportId.length > 100) return;
    if (!action || (action !== 'approve' && action !== 'reject')) return;
    
    setSelectedReport(reportId.trim());
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      priority: 'all'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Review Queue',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTitleStyle: { color: Colors.text.primary }
        }} 
      />
      
      {/* Header with Stats */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{reportStatsQuery.data?.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{reportStatsQuery.data?.total || 0}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color={activeFiltersCount > 0 ? Colors.text.white : Colors.text.primary} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Reports List */}
      <ScrollView 
        style={styles.content}

      >
        {/* Priority Queue - Pending Reports */}
        {pendingReports.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color={Colors.warning} />
              <Text style={styles.sectionTitle}>Priority Queue ({pendingReports.length})</Text>
            </View>
            {pendingReports.map((report: any) => (
              <View key={report.id} style={[styles.reportCard, styles.pendingCard]}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportMeta}>
                    {getCategoryIcon(report.category)}
                    <Text style={styles.categoryText}>{report.category}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
                      <Text style={[styles.priorityText, { color: getPriorityColor(report.priority) }]}>
                        {report.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportTime}>
                    {new Date(report.submittedAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportContent} numberOfLines={3}>
                  {report.content}
                </Text>
                
                <View style={styles.reportFooter}>
                  <Text style={styles.reportSubmitter}>By: {report.submittedBy}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => openReviewModal(report.id, 'reject')}
                    >
                      <XCircle size={16} color={Colors.error} />
                      <Text style={[styles.actionButtonText, { color: Colors.error }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => openReviewModal(report.id, 'approve')}
                    >
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={[styles.actionButtonText, { color: Colors.success }]}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {report.attachments && report.attachments.length > 0 && (
                  <View style={styles.attachments}>
                    <Paperclip size={14} color={Colors.text.secondary} />
                    <Text style={styles.attachmentText}>
                      {report.attachments.length} attachment(s)
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* All Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Reports</Text>
          {reportsQuery.data?.reports?.map((report: any) => (
            <TouchableOpacity
              key={report.id}
              style={[
                styles.reportCard,
                report.status === 'pending' && styles.pendingCard,
                report.status === 'approved' && styles.approvedCard,
                report.status === 'rejected' && styles.rejectedCard
              ]}
              onPress={() => setSelectedReport(report.id)}
            >
              <View style={styles.reportHeader}>
                <View style={styles.reportMeta}>
                  {getCategoryIcon(report.category)}
                  <Text style={styles.categoryText}>{report.category}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(report.priority) }]}>
                      {report.priority}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, 
                    report.status === 'pending' ? styles.pendingStatusBadge :
                    report.status === 'approved' ? styles.approvedStatusBadge :
                    styles.rejectedStatusBadge
                  ]}>
                    <Text style={[styles.statusText,
                      report.status === 'pending' ? styles.pendingStatusText :
                      report.status === 'approved' ? styles.approvedStatusText :
                      styles.rejectedStatusText
                    ]}>
                      {report.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportTime}>
                  {new Date(report.submittedAt).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportContent} numberOfLines={2}>
                {report.content}
              </Text>
              
              <Text style={styles.reportSubmitter}>By: {report.submittedBy}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {reportsQuery.data?.reports?.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.text.light} />
            <Text style={styles.emptyStateText}>No reports found</Text>
            <Text style={styles.emptyStateSubtext}>
              {activeFiltersCount > 0 ? 'Try adjusting your filters' : 'All reports have been reviewed'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Report Detail Modal */}
      <Modal
        visible={!!selectedReport && !showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: insets.top + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {selectedReportQuery.data && (selectedReportQuery.data as any) && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Title</Text>
                  <Text style={styles.detailValue}>{(selectedReportQuery.data as any).title}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Category & Priority</Text>
                  <View style={styles.detailMeta}>
                    {getCategoryIcon((selectedReportQuery.data as any).category)}
                    <Text style={styles.detailMetaText}>{(selectedReportQuery.data as any).category}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor((selectedReportQuery.data as any).priority) + '20' }]}>
                      <Text style={[styles.priorityText, { color: getPriorityColor((selectedReportQuery.data as any).priority) }]}>
                        {(selectedReportQuery.data as any).priority}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Content</Text>
                  <Text style={styles.detailValue}>{(selectedReportQuery.data as any).content}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Submitted By</Text>
                  <Text style={styles.detailValue}>{(selectedReportQuery.data as any).submittedBy}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Submitted At</Text>
                  <Text style={styles.detailValue}>
                    {new Date((selectedReportQuery.data as any).submittedAt).toLocaleString()}
                  </Text>
                </View>
                
                {(selectedReportQuery.data as any).reviewedAt && (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Reviewed By</Text>
                      <Text style={styles.detailValue}>{(selectedReportQuery.data as any).reviewedBy}</Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Reviewed At</Text>
                      <Text style={styles.detailValue}>
                        {new Date((selectedReportQuery.data as any).reviewedAt).toLocaleString()}
                      </Text>
                    </View>
                    
                    {(selectedReportQuery.data as any).adminComments && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Admin Comments</Text>
                        <Text style={styles.detailValue}>{(selectedReportQuery.data as any).adminComments}</Text>
                      </View>
                    )}
                  </>
                )}
                
                {(selectedReportQuery.data as any).status === 'pending' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.rejectButton]}
                      onPress={() => openReviewModal((selectedReportQuery.data as any)!.id, 'reject')}
                    >
                      <XCircle size={20} color={Colors.error} />
                      <Text style={[styles.modalActionText, { color: Colors.error }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.approveButton]}
                      onPress={() => openReviewModal((selectedReportQuery.data as any)!.id, 'approve')}
                    >
                      <CheckCircle size={20} color={Colors.success} />
                      <Text style={[styles.modalActionText, { color: Colors.success }]}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.reviewModalOverlay}>
          <View style={styles.reviewModalContent}>
            <Text style={styles.reviewModalTitle}>
              {reviewAction === 'approve' ? 'Approve Report' : 'Reject Report'}
            </Text>
            <Text style={styles.reviewModalSubtitle}>
              {reviewAction === 'approve' 
                ? 'This report will be marked as approved and the issue will be tracked.'
                : 'This report will be marked as rejected. Please provide a reason.'
              }
            </Text>
            
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>
                {reviewAction === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection'}
              </Text>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={4}
                placeholder={reviewAction === 'approve' 
                  ? 'Add any comments about this report...'
                  : 'Please explain why this report is being rejected...'
                }
                value={adminComments}
                onChangeText={setAdminComments}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.reviewModalActions}>
              <TouchableOpacity
                style={[styles.reviewModalButton, styles.cancelReviewButton]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.cancelReviewText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reviewModalButton,
                  reviewAction === 'approve' ? styles.approveReviewButton : styles.rejectReviewButton
                ]}
                onPress={handleReview}
                disabled={reviewMutation.isPending}
              >
                <Send size={16} color={Colors.text.white} />
                <Text style={styles.confirmReviewText}>
                  {reviewMutation.isPending ? 'Processing...' : 
                   reviewAction === 'approve' ? 'Approve' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.filtersModalOverlay}>
          <View style={styles.filtersModalContent}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Filter Reports</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filtersBody}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Status</Text>
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterOption, filters.status === status && styles.filterOptionActive]}
                    onPress={() => setFilters(prev => ({ ...prev, status: status as any }))}
                  >
                    <Text style={[styles.filterOptionText, filters.status === status && styles.filterOptionTextActive]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Category</Text>
                {['all', 'bug', 'feature', 'feedback', 'safety', 'other'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.filterOption, filters.category === category && styles.filterOptionActive]}
                    onPress={() => setFilters(prev => ({ ...prev, category: category as any }))}
                  >
                    <Text style={[styles.filterOptionText, filters.category === category && styles.filterOptionTextActive]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Priority</Text>
                {['all', 'critical', 'high', 'medium', 'low'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[styles.filterOption, filters.priority === priority && styles.filterOptionActive]}
                    onPress={() => setFilters(prev => ({ ...prev, priority: priority as any }))}
                  >
                    <Text style={[styles.filterOptionText, filters.priority === priority && styles.filterOptionTextActive]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.filtersActions}>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetFiltersText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
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
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  filterButton: {
    padding: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
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
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  approvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  rejectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pendingStatusBadge: {
    backgroundColor: Colors.warning + '20',
  },
  approvedStatusBadge: {
    backgroundColor: Colors.success + '20',
  },
  rejectedStatusBadge: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pendingStatusText: {
    color: Colors.warning,
  },
  approvedStatusText: {
    color: Colors.success,
  },
  rejectedStatusText: {
    color: Colors.error,
  },
  reportTime: {
    fontSize: 12,
    color: Colors.text.light,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  reportContent: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportSubmitter: {
    fontSize: 12,
    color: Colors.text.light,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  approveButton: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  rejectButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  attachmentText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailMetaText: {
    fontSize: 14,
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '85%',
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  reviewModalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    minHeight: 80,
  },
  reviewModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelReviewButton: {
    backgroundColor: Colors.surfaceLight,
  },
  approveReviewButton: {
    backgroundColor: Colors.success,
  },
  rejectReviewButton: {
    backgroundColor: Colors.error,
  },
  cancelReviewText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  confirmReviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  filtersModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filtersModalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  filtersBody: {
    flex: 1,
    padding: 20,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  filterOptionTextActive: {
    color: Colors.text.white,
    fontWeight: '500',
  },
  filtersActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  resetFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  resetFiltersText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});