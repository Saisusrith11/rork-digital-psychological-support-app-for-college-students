

type TimeRange = '7d' | '30d' | '90d';

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
      return this.cache.get(key)!.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Generate realistic mock data based on current date and time
  private generateRealisticData() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBusinessHours = hour >= 9 && hour <= 17;

    // Base multipliers for realistic patterns
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
    // Higher stress during exam periods (April-May, November-December)
    if (month === 3 || month === 4 || month === 10 || month === 11) {
      return 1.4;
    }
    // Lower during summer break (June-July)
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
        avgSessionDuration: 8.4 + (Math.random() * 2 - 1), // 7.4-9.4 minutes
        totalSessions: Math.floor(3420 * totalMultiplier),
        bounceRate: 0.23 + (Math.random() * 0.1 - 0.05) // 18-28%
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
        averageScore: 12.3 + (seasonalMultiplier - 1) * 3, // Higher scores during stressful periods
        riskDistribution: {
          minimal: 38 - Math.floor((seasonalMultiplier - 1) * 10),
          mild: 32,
          moderate: 22 + Math.floor((seasonalMultiplier - 1) * 8),
          severe: 8 + Math.floor((seasonalMultiplier - 1) * 2)
        },
        consentRate: 0.67 + (Math.random() * 0.1 - 0.05) // 62-72%
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
        avgTimeSpent: 4.2 + Math.random() * 3, // 4-7 minutes
        completionRate: 0.65 + Math.random() * 0.25, // 65-90%
        rating: 4.1 + Math.random() * 0.8 // 4.1-4.9
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
        avgResponseTime: 2.3 + Math.random() * 1.5, // 2-4 hours
        satisfactionScore: 4.6 + Math.random() * 0.3 // 4.6-4.9
      };
    });
  }

  async getSystemHealth(): Promise<SystemHealth> {
    return this.getCachedOrFetch('system_health', async () => {
      return {
        uptime: 99.2 + Math.random() * 0.7, // 99.2-99.9%
        responseTime: 145 + Math.random() * 50, // 145-195ms
        errorRate: 0.02 + Math.random() * 0.03, // 0.02-0.05%
        activeConnections: Math.floor(234 + Math.random() * 100),
        serverLoad: 0.45 + Math.random() * 0.3 // 45-75%
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
        
        // Add some randomness and trends
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
      const alerts = [];
      const { seasonalMultiplier } = this.generateRealisticData();
      
      // More alerts during stressful periods
      const alertCount = Math.floor(2 * seasonalMultiplier);
      
      for (let i = 0; i < alertCount; i++) {
        const severities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
        const messages = {
          high: 'High-risk assessment detected - immediate attention required',
          medium: 'Student showing signs of moderate distress',
          low: 'Follow-up recommended for recent assessment'
        };
        
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
      const assessments = [];
      const count = 5 + Math.floor(Math.random() * 8); // 5-12 assessments
      
      const types = ['PHQ-9', 'GAD-7', 'GHQ-12'];
      const riskLevels = ['Minimal', 'Mild', 'Moderate', 'Severe'];
      
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

  // Clear cache (useful for testing or forced refresh)
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache status for debugging
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
export type { UserEngagement, AssessmentMetrics, ResourceUsage, CounselorMetrics, SystemHealth, TrendData };