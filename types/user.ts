export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  college: string;
  year: string;
  course: string;
  avatar?: string;
  createdAt: string;
  isAnonymous?: boolean;
}

export interface UserProgress {
  daysActive: number;
  resourcesUsed: number;
  sessionsBooked: number;
  moodEntries: number;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: 'great' | 'good' | 'okay' | 'low' | 'hard';
  date: string;
  notes?: string;
}