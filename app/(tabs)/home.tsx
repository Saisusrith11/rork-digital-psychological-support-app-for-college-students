import React, { useCallback, useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useMood } from '@/hooks/mood-store';
import { useLanguage } from '@/hooks/language-store';
import { useRouter } from '../../utils/navigation';
import { TouchableOpacity } from 'react-native';
import MoodSelector from '@/components/MoodSelector';
import CrisisSupport from '@/components/CrisisSupport';
import QuickActions from '@/components/QuickActions';
import ResourceCard from '@/components/ResourceCard';
import AssessmentCard from '@/components/AssessmentCard';
import { getRandomQuote, Quote } from '@/constants/quotes';

export default function HomeScreen() {
  const { user } = useAuth();
  const { todaysMood, addMoodEntry, setUserId } = useMood();
  const { t } = useLanguage();
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const router = useRouter();

  useEffect(() => {
    setDailyQuote(getRandomQuote());
  }, []);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    } else {
      setUserId(null);
    }
  }, [user?.id, setUserId]);

  const handleMoodSelect = useCallback((mood: 'great' | 'good' | 'okay' | 'low' | 'hard') => {
    if (!mood || typeof mood !== 'string') return;
    const validMoods = ['great', 'good', 'okay', 'low', 'hard'];
    if (!validMoods.includes(mood)) return;
    addMoodEntry(mood);
  }, [addMoodEntry]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 17) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
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

        <CrisisSupport />

        <QuickActions />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.inspiration.title')}</Text>
          </View>
          
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              &ldquo;{dailyQuote?.text || 'Peace comes from within. Do not seek it without.'}&rdquo;
            </Text>
            <Text style={styles.quoteAuthor}>- {dailyQuote?.author || 'Buddha'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.articles.title')}</Text>
            <TouchableOpacity onPress={() => router.navigate('Student')}>
              <Text style={styles.viewAll}>{t('common.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          <ResourceCard
            title="Stress Management Techniques"
            description="Learn practical ways to manage academic stress"
            duration="5 min read"
            onPress={() => router.navigate('ResourceDetail', { resourceId: '1' })}
          />
          
          <ResourceCard
            title="Better Sleep for Students"
            description="Improve your sleep quality with evidence-based tips"
            duration="7 min read"
            onPress={() => router.navigate('ResourceDetail', { resourceId: '2' })}
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
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});