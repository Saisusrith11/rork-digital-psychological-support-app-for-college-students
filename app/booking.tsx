import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { ArrowLeft, Calendar, Clock, User, MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
];

const counselors = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialization: 'Anxiety & Depression',
    experience: '8 years',
    rating: 4.8,
    languages: ['English', 'Hindi', 'Tamil'],
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Academic Stress',
    experience: '6 years',
    rating: 4.7,
    languages: ['English', 'Hindi', 'Telugu'],
  },
  {
    id: '3',
    name: 'Dr. Meera Patel',
    specialization: 'Social Anxiety & Relationships',
    experience: '5 years',
    rating: 4.9,
    languages: ['English', 'Hindi'],
  },
  {
    id: '4',
    name: 'Dr. Arjun Nair',
    specialization: 'Academic Performance & Stress',
    experience: '7 years',
    rating: 4.6,
    languages: ['English', 'Tamil', 'Telugu'],
  },
];

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedCounselor, setSelectedCounselor] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleTimeSelect = useCallback((time: string) => {
    if (!time || typeof time !== 'string') return;
    if (time.length > 20) return;
    const sanitized = time.trim();
    if (!sanitized) return;
    setSelectedTime(sanitized);
  }, []);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !selectedCounselor) {
      setShowErrorModal(true);
      return;
    }

    setShowSuccessModal(true);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
      });
    }
    return dates;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateContainer}>
              {generateDates().map((dateObj) => (
                <TouchableOpacity
                  key={dateObj.date}
                  style={[
                    styles.dateButton,
                    selectedDate === dateObj.date && styles.selectedDate,
                  ]}
                  onPress={() => setSelectedDate(dateObj.date)}
                >
                  <Text style={[
                    styles.dateText,
                    selectedDate === dateObj.date && styles.selectedDateText,
                  ]}>
                    {dateObj.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.selectedTime,
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText,
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Select Counselor</Text>
          </View>
          {counselors.map((counselor) => (
            <TouchableOpacity
              key={counselor.id}
              style={[
                styles.counselorCard,
                selectedCounselor === counselor.id && styles.selectedCounselor,
              ]}
              onPress={() => setSelectedCounselor(counselor.id)}
            >
              <View style={styles.counselorAvatar}>
                <Text style={styles.counselorInitials}>
                  {counselor.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.counselorInfo}>
                <Text style={styles.counselorName}>{counselor.name}</Text>
                <Text style={styles.counselorSpecialization}>{counselor.specialization}</Text>
                <Text style={styles.counselorLanguages}>Languages: {counselor.languages.join(', ')}</Text>
                <View style={styles.counselorMeta}>
                  <Text style={styles.counselorExperience}>{counselor.experience}</Text>
                  <Text style={styles.counselorRating}>★ {counselor.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.locationSection}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Session Location</Text>
          </View>
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Campus Counseling Center</Text>
            <Text style={styles.locationAddress}>Building A, Room 201</Text>
            <Text style={styles.locationNote}>
              Sessions are completely confidential and private
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime || !selectedCounselor) && styles.bookButtonDisabled,
          ]}
          onPress={handleBooking}
          disabled={!selectedDate || !selectedTime || !selectedCounselor}
        >
          <Text style={styles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>Please select date, time, and counselor</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Booking Confirmed</Text>
            <Text style={styles.modalMessage}>
              Your session has been booked for {selectedDate} at {selectedTime}
            </Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  dateButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  selectedDateText: {
    color: Colors.text.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  selectedTime: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  selectedTimeText: {
    color: Colors.text.white,
  },
  counselorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCounselor: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  counselorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  counselorInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  counselorInfo: {
    flex: 1,
  },
  counselorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  counselorSpecialization: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  counselorLanguages: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  counselorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counselorExperience: {
    fontSize: 12,
    color: Colors.text.light,
  },
  counselorRating: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
  },
  locationSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  locationNote: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: Colors.text.light,
  },
  bookButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
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
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});