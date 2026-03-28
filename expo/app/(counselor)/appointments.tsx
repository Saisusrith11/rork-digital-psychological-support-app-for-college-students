import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Phone
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CounselorAppointments() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  const appointments = [
    {
      id: '1',
      studentId: 'student_001',
      studentName: 'Anonymous Student',
      time: '10:00 AM',
      duration: '50 min',
      type: 'Initial Consultation',
      status: 'confirmed',
      language: 'English',
      notes: 'First session - anxiety concerns',
      isUrgent: false,
    },
    {
      id: '2',
      studentId: 'student_002',
      studentName: 'Student #2847',
      time: '11:30 AM',
      duration: '50 min',
      type: 'Follow-up',
      status: 'confirmed',
      language: 'Tamil',
      notes: 'Progress review session',
      isUrgent: false,
    },
    {
      id: '3',
      studentId: 'student_003',
      studentName: 'Anonymous Student',
      time: '2:00 PM',
      duration: '50 min',
      type: 'Crisis Support',
      status: 'pending',
      language: 'Hindi',
      notes: 'Urgent - depression screening score 26+',
      isUrgent: true,
    },
    {
      id: '4',
      studentId: 'student_004',
      studentName: 'Student #1923',
      time: '4:00 PM',
      duration: '50 min',
      type: 'Group Session',
      status: 'confirmed',
      language: 'English',
      notes: 'Stress management workshop',
      isUrgent: false,
    },
  ];

  const getStatusColor = (status: string, isUrgent: boolean) => {
    if (isUrgent) return Colors.error;
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'completed':
        return Colors.text.secondary;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string, isUrgent: boolean) => {
    if (isUrgent) return <AlertCircle size={16} color={Colors.error} />;
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'pending':
        return <Clock size={16} color={Colors.warning} />;
      default:
        return <Clock size={16} color={Colors.text.secondary} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <Text style={styles.subtitle}>Manage your counseling sessions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Today - {new Date().toLocaleDateString()}</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.calendarButtonText}>Change Date</Text>
          </TouchableOpacity>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>
            Scheduled Sessions ({appointments.length})
          </Text>
          
          {appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.timeContainer}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                  <Text style={styles.duration}>({appointment.duration})</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(appointment.status, appointment.isUrgent) + '20' }
                ]}>
                  {getStatusIcon(appointment.status, appointment.isUrgent)}
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(appointment.status, appointment.isUrgent) }
                  ]}>
                    {appointment.isUrgent ? 'URGENT' : appointment.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentContent}>
                <View style={styles.studentInfo}>
                  <User size={16} color={Colors.text.secondary} />
                  <Text style={styles.studentName}>{appointment.studentName}</Text>
                </View>
                
                <Text style={styles.appointmentType}>{appointment.type}</Text>
                
                <View style={styles.languageContainer}>
                  <Text style={styles.languageLabel}>Language: </Text>
                  <Text style={styles.languageValue}>{appointment.language}</Text>
                </View>

                {appointment.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={[
                      styles.notesText,
                      appointment.isUrgent && { color: Colors.error }
                    ]}>
                      {appointment.notes}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.appointmentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageSquare size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Chat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Phone size={16} color={Colors.success} />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                  <Text style={styles.primaryActionText}>Start Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>3</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>1</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.error }]}>1</Text>
              <Text style={styles.statLabel}>Urgent</Text>
            </View>
          </View>
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
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  calendarButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  appointmentsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  duration: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentContent: {
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  appointmentType: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  languageValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
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
  appointmentActions: {
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
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});