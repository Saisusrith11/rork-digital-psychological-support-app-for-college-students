import AsyncStorage from '@react-native-async-storage/async-storage';

// Database schema types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'counselor' | 'admin' | 'volunteer';
  college?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface College {
  id: string;
  name: string;
  location: string;
  studentCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
  documents: {
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'wellness' | 'exercise' | 'education';
  category: string;
  duration: number;
  points: number;
  riskLevel: 'low' | 'medium' | 'high' | 'all';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  college: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastAssessment: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  studentId: string;
  type: 'crisis' | 'feedback' | 'concern';
  content: string;
  status: 'pending' | 'resolved' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
  submittedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  title: string;
  category: string;
  submittedBy: string;
  adminComments?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  attachments?: any[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'audio';
  url: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  volunteerId: string;
  status: 'active' | 'closed' | 'pending';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'student' | 'volunteer' | 'counselor' | 'admin';
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  sentAt: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  responses: Record<string, any>;
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  completedAt: string;
  recommendations: string[];
}

export interface Helpline {
  id: string;
  name: string;
  phone: string;
  description: string;
  availability: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Database class for managing local storage
class Database {
  private static instance: Database;
  private initialized = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize default data if not exists
      await this.initializeDefaultData();
      this.initialized = true;
      console.log('[Database] Initialized successfully');
    } catch (error) {
      console.error('[Database] Initialization failed:', error);
      throw error;
    }
  }

  private async initializeDefaultData(): Promise<void> {
    // Initialize colleges
    const existingColleges = await this.getItem<College[]>('colleges');
    if (!existingColleges || existingColleges.length === 0) {
      const defaultColleges: College[] = [
        {
          id: '1',
          name: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          studentCount: 45000,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Stanford University',
          location: 'Stanford, CA',
          studentCount: 17000,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Harvard University',
          location: 'Cambridge, MA',
          studentCount: 23000,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await this.setItem('colleges', defaultColleges);
    }

    // Initialize helplines
    const existingHelplines = await this.getItem<Helpline[]>('helplines');
    if (!existingHelplines || existingHelplines.length === 0) {
      const defaultHelplines: Helpline[] = [
        {
          id: '1',
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          description: '24/7 crisis support for people in suicidal crisis or emotional distress',
          availability: '24/7',
          category: 'crisis',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Crisis Text Line',
          phone: 'Text HOME to 741741',
          description: 'Free, 24/7 support for those in crisis',
          availability: '24/7',
          category: 'crisis',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await this.setItem('helplines', defaultHelplines);
    }

    // Initialize activities
    const existingActivities = await this.getItem<Activity[]>('activities');
    if (!existingActivities || existingActivities.length === 0) {
      const defaultActivities: Activity[] = [
        {
          id: '1',
          title: 'Mindfulness Meditation',
          description: 'A guided meditation session to help reduce stress and anxiety',
          type: 'wellness',
          category: 'mindfulness',
          duration: 15,
          points: 20,
          riskLevel: 'all',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Breathing Exercise',
          description: 'Simple breathing techniques for immediate stress relief',
          type: 'exercise',
          category: 'crisis',
          duration: 5,
          points: 15,
          riskLevel: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await this.setItem('activities', defaultActivities);
    }

    // Initialize reports
    const existingReports = await this.getItem<Report[]>('reports');
    if (!existingReports || existingReports.length === 0) {
      const defaultReports: Report[] = [
        {
          id: '1',
          studentId: '1',
          type: 'feedback',
          content: 'The counseling session was very helpful. I would like to request more sessions.',
          status: 'pending',
          priority: 'medium',
          submittedAt: new Date().toISOString(),
          title: 'Request for Additional Counseling Sessions',
          category: 'feedback',
          submittedBy: 'Student User'
        },
        {
          id: '2',
          studentId: '2',
          type: 'crisis',
          content: 'I am experiencing severe anxiety and need immediate support.',
          status: 'pending',
          priority: 'high',
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          title: 'Urgent: Severe Anxiety Support Needed',
          category: 'crisis',
          submittedBy: 'Anonymous Student'
        },
        {
          id: '3',
          studentId: '3',
          type: 'concern',
          content: 'The app crashes when I try to access the wellness activities section.',
          status: 'resolved',
          priority: 'low',
          submittedAt: new Date(Date.now() - 172800000).toISOString(),
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
          resolvedBy: 'admin@example.com',
          notes: 'Fixed in latest update',
          title: 'App Crash in Wellness Section',
          category: 'bug',
          submittedBy: 'Test Student'
        }
      ];
      await this.setItem('reports', defaultReports);
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`[Database] Error getting ${key}:`, error);
      return null;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[Database] Error setting ${key}:`, error);
      throw error;
    }
  }

  // Generic CRUD operations
  async findMany<T>(table: string, filter?: (item: T) => boolean): Promise<T[]> {
    const items = await this.getItem<T[]>(table) || [];
    return filter ? items.filter(filter) : items;
  }

  async findById<T extends { id: string }>(table: string, id: string): Promise<T | null> {
    const items = await this.getItem<T[]>(table) || [];
    return items.find(item => item.id === id) || null;
  }

  async create<T extends { id: string }>(table: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, 'id'>>): Promise<T> {
    const items = await this.getItem<T[]>(table) || [];
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      id: data.id || Date.now().toString(),
      createdAt: now,
      updatedAt: now
    } as unknown as T;
    
    items.push(newItem);
    await this.setItem(table, items);
    return newItem;
  }

  async update<T extends { id: string; updatedAt?: string }>(table: string, id: string, data: Partial<T>): Promise<T | null> {
    const items = await this.getItem<T[]>(table) || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    items[index] = updatedItem;
    await this.setItem(table, items);
    return updatedItem;
  }

  async delete(table: string, id: string): Promise<boolean> {
    const items = await this.getItem<any[]>(table) || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    await this.setItem(table, items);
    return true;
  }

  async count(table: string, filter?: (item: any) => boolean): Promise<number> {
    const items = await this.getItem<any[]>(table) || [];
    return filter ? items.filter(filter).length : items.length;
  }

  async clear(table: string): Promise<void> {
    await AsyncStorage.removeItem(table);
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
    this.initialized = false;
  }
}

export const db = Database.getInstance();
export default db;