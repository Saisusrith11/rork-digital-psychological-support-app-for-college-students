export type UserRole = 'student' | 'counselor' | 'admin';

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
  role?: UserRole;
  languages?: string[];
  specialization?: string;
  isOnline?: boolean;
  showUsername?: boolean;
}

export interface Counselor extends User {
  role: 'counselor';
  specialization: string;
  languages: string[];
  isOnline: boolean;
  rating?: number;
  experience?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'system' | 'feedback';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  message: string;
  rating?: number;
  category: 'bug' | 'feature' | 'general' | 'complaint';
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  adminResponse?: string;
  respondedAt?: string;
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