import React, { useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Bell, BarChart3 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useMood } from '@/hooks/mood-store';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import MoodSelector from '@/components/MoodSelector';
import CrisisSupport from '@/components/CrisisSupport';
import QuickActions from '@/components/QuickActions';
import ResourceCard from '@/components/ResourceCard';
import AssessmentCard from '@/components/AssessmentCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const { todaysMood, addMoodEntry } = useMood();

  const handleMoodSelect = useCallback((mood: 'great' | 'good' | 'okay' | 'low' | 'hard') => {
    if (!mood || typeof mood !== 'string') return;
    const validMoods = ['great', 'good', 'okay', 'low', 'hard'];
    if (!validMoods.includes(mood)) return;
    addMoodEntry(mood);
  }, [addMoodEntry]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.fullName || 'Student'}</Text>
          </View>
          <View style={styles.notificationContainer}>
            <Bell size={24} color={Colors.text.secondary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>2</Text>
            </View>
          </View>
        </View>

        <MoodSelector 
          selectedMood={todaysMood?.mood}
          onMoodSelect={handleMoodSelect}
        />

        <AssessmentCard />

        <View style={styles.weeklyReportCard}>
          <TouchableOpacity 
            style={styles.weeklyReportButton}
            onPress={() => router.push('/weekly-report')}
          >
            <View style={styles.weeklyReportIcon}>
              <BarChart3 size={24} color={Colors.primary} />
            </View>
            <View style={styles.weeklyReportContent}>
              <Text style={styles.weeklyReportTitle}>Weekly Mood Report</Text>
              <Text style={styles.weeklyReportSubtitle}>View your mood trends and insights</Text>
            </View>
          </TouchableOpacity>
        </View>

        <CrisisSupport />

        <QuickActions />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Resources</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
          
          <ResourceCard
            title="5-Minute Breathing"
            description="Calm your mind with guided breathing"
            duration="5 min"
            onPress={() => console.log('Open breathing exercise')}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  userName: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  weeklyReportCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  weeklyReportButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  weeklyReportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  weeklyReportContent: {
    flex: 1,
  },
  weeklyReportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  weeklyReportSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});