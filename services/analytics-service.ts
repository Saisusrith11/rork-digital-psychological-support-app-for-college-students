import AsyncStorage from '@react-native-async-storage/async-storage';

type TimeRange = '7d' | '30d' | '90d';

type MoodType = 'great' | 'good' | 'okay' | 'low' | 'hard';

interface UserEngagement {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  totalSessions: number;
  bounceRate: number;
}

interface AssessmentMetrics {
  totalAssessments: number;
  phq9Count: number;
  gad7Count: number;
  ghq12Count: number;
  averageScore: number;
  riskDistribution: {
    minimal: number;
    mild: number;
    moderate: number;
    severe: number;
  };
  consentRate: number;
}

interface ResourceUsage {
  id: string;
  title: string;
  category: string;
  views: number;
  avgTimeSpent: number;
  completionRate: number;
  rating: number;
}

interface CounselorMetrics {
  totalCounselors: number;
  activeCounselors: number;
  totalAppointments: number;
  completedSessions: number;
  avgResponseTime: number;
  satisfactionScore: number;
}

interface SystemHealth {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  serverLoad: number;
}

interface TrendData {
  date: string;
  users: number;
  assessments: number;
  sessions: number;
  resources: number;
}

interface MoodEvent {
  id: string;
  userId: string;
  mood: MoodType;
  date: string;
}

interface MoodAnalytics {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  totalEntries: number;
  moodDistribution: Record<MoodType, number>;
  weeklyData: MoodEvent[];
}

const MOOD_EVENTS_KEY = 'analytics_mood_events';

class AnalyticsService {
  private static instance: AnalyticsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private async getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Persisted mood analytics
  async logMoodEvent(userId: string, mood: MoodType): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(MOOD_EVENTS_KEY);
      const list: MoodEvent[] = raw ? JSON.parse(raw) : [];
      const event: MoodEvent = {
        id: `mood_${Date.now()}`,
        userId,
        mood,
        date: new Date().toISOString(),
      };
      list.push(event);
      await AsyncStorage.setItem(MOOD_EVENTS_KEY, JSON.stringify(list));
      this.cache.delete(`mood_analytics_${userId}_7d`);
      this.cache.delete(`mood_analytics_${userId}_30d`);
      this.cache.delete(`mood_analytics_${userId}_90d`);
    } catch (e) {
      console.log('analyticsService.logMoodEvent error', e);
    }
  }

  async getMoodAnalyticsReal(userId: string, range: TimeRange = '7d'): Promise<MoodAnalytics> {
    const cacheKey = `mood_analytics_${userId}_${range}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const raw = await AsyncStorage.getItem(MOOD_EVENTS_KEY);
      const list: MoodEvent[] = raw ? JSON.parse(raw) : [];
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const now = new Date();
      const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const userEvents = list
        .filter(e => e.userId === userId)
        .filter(e => new Date(e.date) >= start && new Date(e.date) <= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (userEvents.length === 0) {
        return {
          averageMood: 0,
          moodTrend: 'stable',
          totalEntries: 0,
          moodDistribution: { great: 0, good: 0, okay: 0, low: 0, hard: 0 },
          weeklyData: [],
        } as MoodAnalytics;
      }

      const moodValues: Record<MoodType, number> = { great: 5, good: 4, okay: 3, low: 2, hard: 1 };
      const distribution: Record<MoodType, number> = { great: 0, good: 0, okay: 0, low: 0, hard: 0 };
      userEvents.forEach(e => { distribution[e.mood] += 1; });
      const averageMood = userEvents.reduce((sum, e) => sum + moodValues[e.mood], 0) / userEvents.length;

      const mid = Math.floor(userEvents.length / 2);
      const first = userEvents.slice(0, mid);
      const second = userEvents.slice(mid);
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (first.length && second.length) {
        const firstAvg = first.reduce((s, e) => s + moodValues[e.mood], 0) / first.length;
        const secondAvg = second.reduce((s, e) => s + moodValues[e.mood], 0) / second.length;
        const diff = secondAvg - firstAvg;
        if (diff > 0.3) trend = 'improving';
        else if (diff < -0.3) trend = 'declining';
      }

      return {
        averageMood,
        moodTrend: trend,
        totalEntries: userEvents.length,
        moodDistribution: distribution,
        weeklyData: userEvents,
      } as MoodAnalytics;
    });
  }

  // Generate realistic mock data based on current date and time
  private generateRealisticData() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBusinessHours = hour >= 9 && hour <= 17;

    const weekendMultiplier = isWeekend ? 0.6 : 1.0;
    const hourMultiplier = isBusinessHours ? 1.2 : 0.8;
    const seasonalMultiplier = this.getSeasonalMultiplier();

    return {
      weekendMultiplier,
      hourMultiplier,
      seasonalMultiplier,
      totalMultiplier: weekendMultiplier * hourMultiplier * seasonalMultiplier
    };
  }

  private getSeasonalMultiplier(): number {
    const month = new Date().getMonth();
    if (month === 3 || month === 4 || month === 10 || month === 11) {
      return 1.4;
    }
    if (month === 5 || month === 6) {
      return 0.7;
    }
    return 1.0;
  }

  async getUserEngagement(range: TimeRange = '30d'): Promise<UserEngagement> {
    return this.getCachedOrFetch(`engagement_${range}`, async () => {
      const { totalMultiplier } = this.generateRealisticData();
      const baseUsers = range === '7d' ? 450 : range === '30d' ? 1247 : 2890;
      return {
        dailyActiveUsers: Math.floor(612 * totalMultiplier),
        weeklyActiveUsers: Math.floor(892 * totalMultiplier),
        monthlyActiveUsers: Math.floor(baseUsers * totalMultiplier),
        avgSessionDuration: 8.4 + (Math.random() * 2 - 1),
        totalSessions: Math.floor(3420 * totalMultiplier),
        bounceRate: 0.23 + (Math.random() * 0.1 - 0.05)
      };
    });
  }

  async getAssessmentMetrics(range: TimeRange = '30d'): Promise<AssessmentMetrics> {
    return this.getCachedOrFetch(`assessments_${range}`, async () => {
      const { seasonalMultiplier } = this.generateRealisticData();
      const baseAssessments = range === '7d' ? 89 : range === '30d' ? 342 : 1156;
      const total = Math.floor(baseAssessments * seasonalMultiplier);
      const phq9 = Math.floor(total * 0.45);
      const gad7 = Math.floor(total * 0.35);
      const ghq12 = Math.floor(total * 0.20);
      return {
        totalAssessments: total,
        phq9Count: phq9,
        gad7Count: gad7,
        ghq12Count: ghq12,
        averageScore: 12.3 + (seasonalMultiplier - 1) * 3,
        riskDistribution: {
          minimal: 38 - Math.floor((seasonalMultiplier - 1) * 10),
          mild: 32,
          moderate: 22 + Math.floor((seasonalMultiplier - 1) * 8),
          severe: 8 + Math.floor((seasonalMultiplier - 1) * 2)
        },
        consentRate: 0.67 + (Math.random() * 0.1 - 0.05)
      };
    });
  }

  async getResourceUsage(range: TimeRange = '30d'): Promise<ResourceUsage[]> {
    return this.getCachedOrFetch(`resources_${range}`, async () => {
      const { totalMultiplier } = this.generateRealisticData();
      const baseResources = [
        { id: 'breathing', title: 'Breathing Exercises', category: 'Mindfulness', baseViews: 1423 },
        { id: 'sleep', title: 'Sleep Hygiene Guide', category: 'Wellness', baseViews: 987 },
        { id: 'exam-stress', title: 'Exam Stress Management', category: 'Academic', baseViews: 1654 },
        { id: 'mindfulness', title: 'Mindfulness Meditation', category: 'Mindfulness', baseViews: 756 },
        { id: 'anxiety-tips', title: 'Managing Anxiety', category: 'Mental Health', baseViews: 1234 },
        { id: 'depression-help', title: 'Understanding Depression', category: 'Mental Health', baseViews: 892 },
        { id: 'social-skills', title: 'Building Social Connections', category: 'Social', baseViews: 543 },
        { id: 'time-management', title: 'Time Management Tips', category: 'Academic', baseViews: 1098 }
      ];
      return baseResources.map(resource => ({
        id: resource.id,
        title: resource.title,
        category: resource.category,
        views: Math.floor(resource.baseViews * totalMultiplier),
        avgTimeSpent: 4.2 + Math.random() * 3,
        completionRate: 0.65 + Math.random() * 0.25,
        rating: 4.1 + Math.random() * 0.8
      })).sort((a, b) => b.views - a.views);
    });
  }

  async getCounselorMetrics(): Promise<CounselorMetrics> {
    return this.getCachedOrFetch('counselor_metrics', async () => {
      const { totalMultiplier } = this.generateRealisticData();
      return {
        totalCounselors: 12,
        activeCounselors: Math.floor(8 * totalMultiplier),
        totalAppointments: Math.floor(156 * totalMultiplier),
        completedSessions: Math.floor(142 * totalMultiplier),
        avgResponseTime: 2.3 + Math.random() * 1.5,
        satisfactionScore: 4.6 + Math.random() * 0.3
      };
    });
  }

  async getSystemHealth(): Promise<SystemHealth> {
    return this.getCachedOrFetch('system_health', async () => {
      return {
        uptime: 99.2 + Math.random() * 0.7,
        responseTime: 145 + Math.random() * 50,
        errorRate: 0.02 + Math.random() * 0.03,
        activeConnections: Math.floor(234 + Math.random() * 100),
        serverLoad: 0.45 + Math.random() * 0.3
      };
    });
  }

  async getTrendData(range: TimeRange = '30d'): Promise<TrendData[]> {
    return this.getCachedOrFetch(`trends_${range}`, async () => {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const data: TrendData[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const multiplier = isWeekend ? 0.7 : 1.0;
        const trendFactor = 1 + (Math.sin(i / days * Math.PI) * 0.2);
        const randomFactor = 0.8 + Math.random() * 0.4;
        data.push({
          date: date.toISOString().split('T')[0],
          users: Math.floor(45 * multiplier * trendFactor * randomFactor),
          assessments: Math.floor(12 * multiplier * trendFactor * randomFactor),
          sessions: Math.floor(28 * multiplier * trendFactor * randomFactor),
          resources: Math.floor(67 * multiplier * trendFactor * randomFactor)
        });
      }
      return data;
    });
  }

  async getCrisisAlerts(): Promise<{
    id: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }[]> {
    return this.getCachedOrFetch('crisis_alerts', async () => {
      const alerts = [] as { id: string; severity: 'high' | 'medium' | 'low'; message: string; timestamp: Date; resolved: boolean; }[];
      const { seasonalMultiplier } = this.generateRealisticData();
      const alertCount = Math.floor(2 * seasonalMultiplier);
      for (let i = 0; i < alertCount; i++) {
        const severities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
        const messages = {
          high: 'High-risk assessment detected - immediate attention required',
          medium: 'Student showing signs of moderate distress',
          low: 'Follow-up recommended for recent assessment'
        } as const;
        const severity = severities[Math.floor(Math.random() * severities.length)];
        alerts.push({
          id: `alert_${i}_${Date.now()}`,
          severity,
          message: messages[severity],
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          resolved: Math.random() > 0.3
        });
      }
      return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
  }

  async getConsentedAssessments(): Promise<{
    id: string;
    anonymousCode: string;
    assessmentType: string;
    riskLevel: string;
    score: number;
    completedAt: Date;
    needsFollowUp: boolean;
  }[]> {
    return this.getCachedOrFetch('consented_assessments', async () => {
      const assessments = [] as { id: string; anonymousCode: string; assessmentType: string; riskLevel: string; score: number; completedAt: Date; needsFollowUp: boolean; }[];
      const count = 5 + Math.floor(Math.random() * 8);
      const types = ['PHQ-9', 'GAD-7', 'GHQ-12'] as const;
      const riskLevels = ['Minimal', 'Mild', 'Moderate', 'Severe'] as const;
      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
        const maxScore = type === 'PHQ-9' ? 27 : type === 'GAD-7' ? 21 : 36;
        assessments.push({
          id: `assessment_${i}_${Date.now()}`,
          anonymousCode: `AN-${Math.floor(Math.random() * 9000) + 1000}`,
          assessmentType: type,
          riskLevel,
          score: Math.floor(Math.random() * maxScore),
          completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          needsFollowUp: riskLevel === 'Moderate' || riskLevel === 'Severe'
        });
      }
      return assessments.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStatus(): { [key: string]: { age: number; size: number } } {
    const status: { [key: string]: { age: number; size: number } } = {};
    this.cache.forEach((value, key) => {
      status[key] = {
        age: Date.now() - value.timestamp,
        size: JSON.stringify(value.data).length
      };
    });
    return status;
  }
}

export const analyticsService = AnalyticsService.getInstance();
export type { UserEngagement, AssessmentMetrics, ResourceUsage, CounselorMetrics, SystemHealth, TrendData, MoodAnalytics, MoodType, MoodEvent };
