export type RiskLevel = 'minimal' | 'mild' | 'moderate' | 'severe';

export interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  points: number;
  riskLevel: RiskLevel;
  category: 'mood' | 'mindfulness' | 'social' | 'education' | 'crisis' | 'goal';
  duration?: number; // in minutes
  completed?: boolean;
  completedAt?: Date;
}

export interface WellnessProgress {
  totalPoints: number;
  dailyPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  completedActivities: string[];
  streak: number;
  lastActivityDate?: Date;
}

export interface WellnessStats {
  totalActivitiesCompleted: number;
  favoriteCategory: string;
  averageDailyPoints: number;
  longestStreak: number;
  currentLevel: number;
  pointsToNextLevel: number;
}

export interface ActivityCompletion {
  activityId: string;
  completedAt: Date;
  points: number;
  notes?: string;
}