export type UserRole = 'student' | 'counselor' | 'admin' | 'volunteer';

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
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  documents?: CounselorDocument[];
  appliedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface CounselorDocument {
  id: string;
  type: 'degree_certificate' | 'transcripts' | 'rci_registration' | 'professional_registration' | 'experience_letter' | 'training_certificate' | 'government_id' | 'cv' | 'reference_contact';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
}

export interface CounselorApplication {
  id: string;
  counselorId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
  };
  professionalInfo: {
    specialization: string[];
    experience: string;
    languages: string[];
    currentEmployment?: string;
  };
  documents: CounselorDocument[];
  termsAccepted: boolean;
  privacyAccepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  documentDeletionScheduled?: string;
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