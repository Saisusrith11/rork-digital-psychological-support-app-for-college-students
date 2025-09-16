import { WellnessActivity, RiskLevel } from '@/types/wellness';

export const WELLNESS_ACTIVITIES: Record<RiskLevel, WellnessActivity[]> = {
  minimal: [
    {
      id: 'minimal_mood_checkin',
      title: 'Daily Mood Check-In',
      description: 'Track feelings and build emotional awareness with a quick, intuitive check-in',
      points: 10,
      riskLevel: 'minimal',
      category: 'mood',
      duration: 2,
    },
    {
      id: 'minimal_gratitude_journal',
      title: 'Gratitude Journal Entry',
      description: 'Write one daily reflection focusing on positive experiences or achievements',
      points: 20,
      riskLevel: 'minimal',
      category: 'mood',
      duration: 5,
    },
    {
      id: 'minimal_mini_meditation',
      title: 'Mini Meditation',
      description: 'Simple guided mindfulness session to sustain resilience and prevent future risk',
      points: 15,
      riskLevel: 'minimal',
      category: 'mindfulness',
      duration: 5,
    },
  ],
  mild: [
    {
      id: 'mild_breathing_exercise',
      title: 'Breathing Exercise',
      description: 'Guided deep-breathing techniques to relieve stress and moderate anxiety',
      points: 15,
      riskLevel: 'mild',
      category: 'mindfulness',
      duration: 5,
    },
    {
      id: 'mild_educational_lesson',
      title: 'Educational Micro-Lesson',
      description: 'Short psychoeducational content about stress management or emotional regulation',
      points: 20,
      riskLevel: 'mild',
      category: 'education',
      duration: 10,
    },
    {
      id: 'mild_social_connection',
      title: 'Social Connection Prompt',
      description: 'Reach out to a friend or peer for a supportive conversation, boosting social wellness',
      points: 25,
      riskLevel: 'mild',
      category: 'social',
      duration: 15,
    },
  ],
  moderate: [
    {
      id: 'moderate_muscle_relaxation',
      title: 'Progressive Muscle Relaxation',
      description: 'Follow-along physical relaxation exercise reducing anxiety\'s physical symptoms',
      points: 25,
      riskLevel: 'moderate',
      category: 'mindfulness',
      duration: 15,
    },
    {
      id: 'moderate_self_assessment',
      title: 'Reflective Self-Assessment',
      description: 'Guided journaling to explore stressors, feelings, and coping skills in greater depth',
      points: 30,
      riskLevel: 'moderate',
      category: 'mood',
      duration: 20,
    },
    {
      id: 'moderate_goal_setting',
      title: 'Goal Setting & Tracking',
      description: 'Personalized goal selection with app-assigned progress tracker for improvement',
      points: 30,
      riskLevel: 'moderate',
      category: 'goal',
      duration: 25,
    },
  ],
  severe: [
    {
      id: 'severe_crisis_support',
      title: 'Crisis Support Card',
      description: 'Instant access to in-app emergency resources—chat, helpline, and personalized safety plans',
      points: 50,
      riskLevel: 'severe',
      category: 'crisis',
      duration: 0,
    },
    {
      id: 'severe_counselor_checkin',
      title: 'Counselor Check-In Scheduling',
      description: 'Guided interface for setting up a professional appointment or requesting digital support',
      points: 40,
      riskLevel: 'severe',
      category: 'crisis',
      duration: 10,
    },
    {
      id: 'severe_gentle_recovery',
      title: 'Gentle Recovery Activity',
      description: 'Low-demand tasks (sensory mindfulness, soothing music, supportive video) for comfort during crisis',
      points: 20,
      riskLevel: 'severe',
      category: 'mindfulness',
      duration: 10,
    },
  ],
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000, 12000];

export const CATEGORY_COLORS = {
  mood: '#FF6B6B',
  mindfulness: '#4ECDC4',
  social: '#45B7D1',
  education: '#96CEB4',
  crisis: '#FF8A80',
  goal: '#FFD93D',
};

export const CATEGORY_ICONS = {
  mood: 'heart',
  mindfulness: 'brain',
  social: 'users',
  education: 'book-open',
  crisis: 'shield-alert',
  goal: 'target',
};

export const RISK_LEVEL_COLORS = {
  minimal: '#4CAF50',
  mild: '#FF9800',
  moderate: '#FF5722',
  severe: '#F44336',
};

export const WELLNESS_QUOTES = [
  "Every small step towards wellness counts.",
  "Your mental health journey is unique and valuable.",
  "Progress, not perfection, is the goal.",
  "You have the strength to overcome challenges.",
  "Taking care of yourself is not selfish, it's necessary.",
  "Each day is a new opportunity for growth.",
  "Your feelings are valid and important.",
  "Healing is not linear, and that's okay.",
];