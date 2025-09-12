import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { 
  User, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CounselorStudents() {
  const insets = useSafeAreaInsets();

  const students = [
    {
      id: '1',
      name: 'Anonymous Student',
      lastSession: '2024-01-15',
      totalSessions: 3,
      status: 'active',
      riskLevel: 'low',
      language: 'English',
      lastAssessmentScore: 8,
      notes: 'Making good progress with anxiety management',
    },
    {
      id: '2',
      name: 'Student #2847',
      lastSession: '2024-01-12',
      totalSessions: 5,
      status: 'active',
      riskLevel: 'moderate',
      language: 'Tamil',
      lastAssessmentScore: 15,
      notes: 'Needs continued support for academic stress',
    },
    {
      id: '3',
      name: 'Anonymous Student',
      lastSession: '2024-01-10',
      totalSessions: 1,
      status: 'urgent',
      riskLevel: 'high',
      language: 'Hindi',
      lastAssessmentScore: 28,
      notes: 'Requires immediate attention - depression screening',
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return Colors.error;
      case 'moderate':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.text.secondary;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle size={16} color={Colors.error} />;
      case 'moderate':
        return <TrendingUp size={16} color={Colors.warning} />;
      case 'low':
        return <CheckCircle size={16} color={Colors.success} />;
      default:
        return <User size={16} color={Colors.text.secondary} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Students</Text>
        <Text style={styles.subtitle}>Manage student cases and progress</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{students.length}</Text>
            <Text style={styles.summaryLabel}>Active Cases</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: Colors.error }]}>
              {students.filter(s => s.riskLevel === 'high').length}
            </Text>
            <Text style={styles.summaryLabel}>High Risk</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: Colors.warning }]}>
              {students.filter(s => s.riskLevel === 'moderate').length}
            </Text>
            <Text style={styles.summaryLabel}>Moderate Risk</Text>
          </View>
        </View>

        {/* Students List */}
        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>Student Cases</Text>
          
          {students.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <User size={20} color={Colors.text.primary} />
                  <Text style={styles.studentName}>{student.name}</Text>
                </View>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskColor(student.riskLevel) + '20' }
                ]}>
                  {getRiskIcon(student.riskLevel)}
                  <Text style={[
                    styles.riskText,
                    { color: getRiskColor(student.riskLevel) }
                  ]}>
                    {student.riskLevel.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.studentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Session:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(student.lastSession).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Sessions:</Text>
                  <Text style={styles.detailValue}>{student.totalSessions}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Language:</Text>
                  <Text style={styles.detailValue}>{student.language}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Assessment Score:</Text>
                  <Text style={[
                    styles.detailValue,
                    { 
                      color: student.lastAssessmentScore > 25 ? Colors.error : 
                             student.lastAssessmentScore > 15 ? Colors.warning : 
                             Colors.success 
                    }
                  ]}>
                    {student.lastAssessmentScore}/45
                  </Text>
                </View>

                {student.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{student.notes}</Text>
                  </View>
                )}
              </View>

              <View style={styles.studentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageSquare size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Message</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Calendar size={16} color={Colors.success} />
                  <Text style={styles.actionButtonText}>Schedule</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                  <Text style={styles.primaryActionText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  studentsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
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
  studentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  notesLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 8,
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
});