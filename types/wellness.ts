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



export interface WellnessStats {
  totalActivitiesCompleted: number;
  favoriteCategory: string;
  averageDailyPoints: number;
  longestStreak: number;
  currentLevel: number;
  pointsToNextLevel: number;
  currentTier: WellnessTier;
  pointsToNextTier: number;
}

export interface ActivityCompletion {
  activityId: string;
  completedAt: Date;
  points: number;
  notes?: string;
}

export type WellnessTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface WellnessBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'discovery' | 'milestone' | 'achievement';
  requirement: {
    type: 'streak' | 'activities' | 'points' | 'category' | 'days';
    value: number;
    category?: string;
  };
  points: number;
  tier?: WellnessTier;
}

export interface WellnessReward {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'theme' | 'feature';
  cost: number;
  tier: WellnessTier;
  unlocked: boolean;
  category?: string;
}

export interface WellnessProgress {
  totalPoints: number;
  dailyPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  completedActivities: string[];
  streak: number;
  lastActivityDate?: Date;
  earnedBadges: string[];
  unlockedRewards: string[];
  spentPoints: number;
}