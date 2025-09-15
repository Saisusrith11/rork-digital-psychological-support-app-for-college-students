import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Heart } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMood } from '@/hooks/mood-store';
import { MoodEntry } from '@/types/user';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;
const chartHeight = 200;

export default function WeeklyReportScreen() {
  const { getMoodAnalytics, getWeeklyMoodData } = useMood();
  const analytics = getMoodAnalytics();
  const weeklyData = getWeeklyMoodData();

  const moodColors = {
    'great': Colors.mood.great,
    'good': Colors.mood.good,
    'okay': Colors.mood.okay,
    'low': Colors.mood.low,
    'hard': Colors.mood.hard,
  };

  const moodLabels = {
    'great': 'Great',
    'good': 'Good',
    'okay': 'Okay',
    'low': 'Low',
    'hard': 'Hard',
  };

  const moodValues = {
    'great': 5,
    'good': 4,
    'okay': 3,
    'low': 2,
    'hard': 1,
  };

  const getTrendIcon = () => {
    switch (analytics.moodTrend) {
      case 'improving':
        return <TrendingUp size={20} color={Colors.success} />;
      case 'declining':
        return <TrendingDown size={20} color={Colors.error} />;
      default:
        return <Minus size={20} color={Colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    switch (analytics.moodTrend) {
      case 'improving':
        return Colors.success;
      case 'declining':
        return Colors.error;
      default:
        return Colors.text.secondary;
    }
  };

  const getTrendDescription = () => {
    switch (analytics.moodTrend) {
      case 'improving':
        return 'Your mood has been improving this week! Keep up the positive momentum.';
      case 'declining':
        return 'Your mood seems to be declining. Consider reaching out for support or trying some self-care activities.';
      default:
        return 'Your mood has been relatively stable this week.';
    }
  };

  const getAverageMoodLabel = () => {
    if (analytics.averageMood >= 4.5) return 'Excellent';
    if (analytics.averageMood >= 3.5) return 'Good';
    if (analytics.averageMood >= 2.5) return 'Fair';
    if (analytics.averageMood >= 1.5) return 'Concerning';
    return 'Needs Attention';
  };

  const renderMoodChart = () => {
    if (weeklyData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>No mood data for this week</Text>
          <Text style={styles.emptyChartSubtext}>Start tracking your daily mood to see insights</Text>
        </View>
      );
    }

    const maxValue = 5;
    const barWidth = (chartWidth - 40) / 7; // 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create array for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {last7Days.map((date, index) => {
            const dayEntry = weeklyData.find(entry => 
              new Date(entry.date).toDateString() === date.toDateString()
            );
            const moodValue = dayEntry ? moodValues[dayEntry.mood] : 0;
            const barHeight = (moodValue / maxValue) * (chartHeight - 60);
            const dayName = days[date.getDay()];
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  {dayEntry && (
                    <View 
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: moodColors[dayEntry.mood],
                          width: barWidth - 8,
                        }
                      ]} 
                    />
                  )}
                </View>
                <Text style={styles.dayLabel}>{dayName}</Text>
                <Text style={styles.dateLabel}>{date.getDate()}</Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.yAxisLabels}>
          {[5, 4, 3, 2, 1].map(value => (
            <Text key={value} style={styles.yAxisLabel}>
              {Object.keys(moodValues).find(key => moodValues[key as keyof typeof moodValues] === value)}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderMoodDistribution = () => {
    const total = analytics.totalEntries;
    if (total === 0) return null;

    return (
      <View style={styles.distributionContainer}>
        {Object.entries(analytics.moodDistribution).map(([mood, count]) => {
          const percentage = ((count as number) / total * 100).toFixed(0);
          return (
            <View key={mood} style={styles.distributionItem}>
              <View style={styles.distributionHeader}>
                <View style={[styles.moodDot, { backgroundColor: moodColors[mood as keyof typeof moodColors] }]} />
                <Text style={styles.distributionLabel}>{moodLabels[mood as keyof typeof moodLabels]}</Text>
                <Text style={styles.distributionPercentage}>{percentage}%</Text>
              </View>
              <View style={styles.distributionBar}>
                <View 
                  style={[
                    styles.distributionFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: moodColors[mood as keyof typeof moodColors],
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Weekly Mood Report',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <BarChart3 size={32} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Your Weekly Mood Summary</Text>
          <Text style={styles.headerSubtitle}>
            {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.totalEntries}</Text>
            <Text style={styles.statLabel}>Days Tracked</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: getTrendColor() }]}>
              {analytics.averageMood.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Average Mood</Text>
            <Text style={styles.statSubLabel}>{getAverageMoodLabel()}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.trendContainer}>
              {getTrendIcon()}
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {analytics.moodTrend.charAt(0).toUpperCase() + analytics.moodTrend.slice(1)}
              </Text>
            </View>
            <Text style={styles.statLabel}>Trend</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Daily Mood Chart</Text>
          </View>
          {renderMoodChart()}
        </View>

        {analytics.totalEntries > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Mood Distribution</Text>
            </View>
            {renderMoodDistribution()}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              {getTrendIcon()}
              <Text style={styles.insightTitle}>Weekly Insight</Text>
            </View>
            <Text style={styles.insightText}>{getTrendDescription()}</Text>
            
            {analytics.moodTrend === 'declining' && (
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationTitle}>Recommendations:</Text>
                <Text style={styles.recommendationText}>• Consider talking to someone you trust</Text>
                <Text style={styles.recommendationText}>• Try relaxation exercises or meditation</Text>
                <Text style={styles.recommendationText}>• Maintain regular sleep and exercise</Text>
                <Text style={styles.recommendationText}>• Reach out to our AI assistant for support</Text>
              </View>
            )}
            
            {analytics.moodTrend === 'improving' && (
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationTitle}>Keep it up!</Text>
                <Text style={styles.recommendationText}>• Continue your current positive habits</Text>
                <Text style={styles.recommendationText}>• Share your success with friends</Text>
                <Text style={styles.recommendationText}>• Consider helping others in the community</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Text style={styles.actionButtonText}>Talk to AI Assistant</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/assessment')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Take Assessment</Text>
          </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    color: Colors.text.light,
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
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
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: chartHeight,
    paddingBottom: 40,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.text.light,
    marginTop: 2,
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 16,
    height: chartHeight - 60,
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.text.light,
    textTransform: 'capitalize',
  },
  emptyChart: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center',
  },
  distributionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  distributionItem: {
    gap: 8,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  distributionLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  distributionPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  distributionBar: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationContainer: {
    gap: 4,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  actionSection: {
    gap: 12,
    paddingBottom: 24,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
});