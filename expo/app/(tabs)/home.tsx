import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, MessageCircle, BookOpen, Activity } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'AI Chat Support',
      subtitle: 'Talk to our AI assistant',
      icon: MessageCircle,
      color: Colors.primary,
      onPress: () => router.push('/ai-chat'),
    },
    {
      title: 'Mental Health Assessment',
      subtitle: 'Check your wellbeing',
      icon: Activity,
      color: '#10B981',
      onPress: () => router.push('/assessment'),
    },
    {
      title: 'Resources',
      subtitle: 'Helpful articles and guides',
      icon: BookOpen,
      color: '#8B5CF6',
      onPress: () => router.push('/(tabs)/resources'),
    },
    {
      title: 'Book Appointment',
      subtitle: 'Schedule with a counselor',
      icon: Heart,
      color: '#EF4444',
      onPress: () => router.push('/booking'),
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>
          {user?.fullName || user?.username || 'Student'}
        </Text>
        <Text style={styles.subtitle}>
          How are you feeling today?
        </Text>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <TouchableOpacity
                key={`action-${action.title}`}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <IconComponent size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to MindCare</Text>
        <Text style={styles.welcomeText}>
          Your digital mental health companion. We&apos;re here to support you on your wellness journey.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  welcomeCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});