import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { 
  User, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  FileText
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';

interface StudentItem {
  id: string;
  name: string;
  lastSession: string;
  totalSessions: number;
  status: 'active' | 'urgent' | 'inactive';
  riskLevel: 'low' | 'moderate' | 'high';
  language: string;
  lastAssessmentScore: number;
  notes?: string;
  consent: boolean;
  anonymousCode: string;
  progress: 'improving' | 'stable' | 'worsening';
}

export default function CounselorStudents() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<StudentItem | null>(null);
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  
  // Fetch assessment data from backend
  const { data: assessmentData } = trpc.assessments.getStudentAssessments.useQuery({ limit: 100 });

  const students: StudentItem[] = useMemo(() => {
    const assessments = assessmentData?.assessments || [];
    
    return [
      {
        id: '1',
        name: 'Anonymous Student',
        lastSession: '2025-09-01',
        totalSessions: 3,
        status: 'active',
        riskLevel: assessments.find(a => a.studentId === '1')?.score > 25 ? 'high' : assessments.find(a => a.studentId === '1')?.score > 15 ? 'moderate' : 'low',
        language: 'English',
        lastAssessmentScore: assessments.find(a => a.studentId === '1')?.score || 8,
        notes: undefined,
        consent: false,
        anonymousCode: 'AN-3842',
        progress: 'improving',
      },
      {
        id: '2',
        name: 'Student #2847',
        lastSession: '2025-09-10',
        totalSessions: 5,
        status: 'active',
        riskLevel: assessments.find(a => a.studentId === '2')?.score > 25 ? 'high' : assessments.find(a => a.studentId === '2')?.score > 15 ? 'moderate' : 'low',
        language: 'Tamil',
        lastAssessmentScore: assessments.find(a => a.studentId === '2')?.score || 15,
        notes: undefined,
        consent: true,
        anonymousCode: 'ST-2847',
        progress: 'stable',
      },
      {
        id: '3',
        name: 'Anonymous Student',
        lastSession: '2025-09-12',
        totalSessions: 1,
        status: 'urgent',
        riskLevel: assessments.find(a => a.studentId === '3')?.score > 25 ? 'high' : assessments.find(a => a.studentId === '3')?.score > 15 ? 'moderate' : 'low',
        language: 'Hindi',
        lastAssessmentScore: assessments.find(a => a.studentId === '3')?.score || 28,
        notes: undefined,
        consent: false,
        anonymousCode: 'AN-9321',
        progress: 'worsening',
      },
    ];
  }, [assessmentData]);

  const [caseNotes, setCaseNotes] = useState<Record<string, string>>({});

  const loadNotes = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const noteKeys = keys.filter((k) => k.startsWith('case_notes_'));
      if (noteKeys.length === 0) return;
      const entries = await AsyncStorage.multiGet(noteKeys);
      const map: Record<string, string> = {};
      entries.forEach(([k, v]) => {
        if (k && typeof v === 'string') {
          map[k.replace('case_notes_', '')] = v;
        }
      });
      setCaseNotes(map);
    } catch (e) {
      console.error('loadNotes error', e);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNote = useCallback(async (studentId: string, value: string) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem(`case_notes_${studentId}`, value);
      setCaseNotes((prev) => ({ ...prev, [studentId]: value }));
      Alert.alert('Saved', 'Session note saved');
      setSelected(null);
      setNote('');
    } catch (e) {
      console.error('saveNote error', e);
      Alert.alert('Error', 'Could not save note');
    } finally {
      setSaving(false);
    }
  }, []);

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
    <View style={[styles.container, { paddingTop: insets.top }]} testID="counselor-students-screen">
      <View style={styles.header}>
        <Text style={styles.title}>My Students</Text>
        <Text style={styles.subtitle}>Consent-gated case access</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <ShieldCheck size={16} color={Colors.primary} />
          <Text style={styles.infoText}>Visible details require student consent. Otherwise show anonymous code.</Text>
        </View>

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

        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>Student Cases</Text>
          {students.map((student) => {
            const displayName = student.consent ? student.name : `Anon (${student.anonymousCode})`;
            const scoreColor = student.lastAssessmentScore > 25 ? Colors.error : student.lastAssessmentScore > 15 ? Colors.warning : Colors.success;
            const storedNote = caseNotes[student.id] ?? '';
            return (
              <View key={student.id} style={styles.studentCard} testID={`student-card-${student.id}`}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <User size={20} color={Colors.text.primary} />
                    <Text style={styles.studentName}>{displayName}</Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(student.riskLevel) + '20' }]}>
                    {getRiskIcon(student.riskLevel)}
                    <Text style={[styles.riskText, { color: getRiskColor(student.riskLevel) }]}>
                      {student.riskLevel.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.studentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Session:</Text>
                    <Text style={styles.detailValue}>{new Date(student.lastSession).toLocaleDateString()}</Text>
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
                    <Text style={[styles.detailValue, { color: scoreColor }]}>
                      {student.consent ? `${student.lastAssessmentScore}/45` : 'Anonymized'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Progress:</Text>
                    <Text style={styles.detailValue}>{student.progress}</Text>
                  </View>

                  {storedNote ? (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Last Note:</Text>
                      <Text style={styles.notesText}>{storedNote}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.studentActions}>
                  <TouchableOpacity style={styles.actionButton} testID={`message-${student.id}`}>
                    <MessageSquare size={16} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} testID={`schedule-${student.id}`}>
                    <Calendar size={16} color={Colors.success} />
                    <Text style={styles.actionButtonText}>Schedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={() => {
                      setSelected(student);
                      setNote(storedNote);
                    }}
                    testID={`add-note-${student.id}`}
                  >
                    <FileText size={16} color={Colors.text.white} />
                    <Text style={styles.primaryActionText}>Add Note</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Session Notes</Text>
            <Text style={styles.modalSubtitle}>
              {selected?.consent ? selected?.name : `Anon (${selected?.anonymousCode ?? ''})`}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Type confidential notes (text only)"
              placeholderTextColor={Colors.text.light}
              value={note}
              onChangeText={setNote}
              multiline
              testID="case-note-input"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setSelected(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                disabled={saving}
                onPress={() => selected?.id && saveNote(selected.id, note)}
                testID="save-note-btn"
              >
                <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
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
  infoBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    marginBottom: 12,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    color: Colors.text.primary,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.surfaceLight,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  saveText: {
    color: Colors.text.white,
    fontWeight: '700',
  },
});