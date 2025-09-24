// Simple in-memory database for demo purposes
const memoryStore: Record<string, any[]> = {};

// Database schema types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'counselor' | 'admin' | 'volunteer';
  college?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface College {
  id: string;
  name: string;
  location: string;
  student_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  college: string;
  risk_level: 'low' | 'medium' | 'high';
  last_assessment: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  student_id: string;
  type: 'crisis' | 'feedback' | 'concern';
  content: string;
  status: 'pending' | 'resolved' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
  submitted_at: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
  title: string;
  category: string;
  submitted_by: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'audio';
  url: string;
  category: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Conversation {
  id: string;
  student_id: string;
  volunteer_id: string;
  status: 'active' | 'closed' | 'pending';
  last_message: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'student' | 'volunteer' | 'counselor' | 'admin';
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  sent_at: string;
}

export interface Assessment {
  id: string;
  student_id: string;
  responses: Record<string, any>;
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  completed_at: string;
  recommendations: string[];
}

export interface Helpline {
  id: string;
  name: string;
  phone: string;
  description: string;
  availability: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Simple database class using in-memory storage
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
      await this.initializeDefaultData();
      this.initialized = true;
      console.log('[Database] Initialized successfully');
    } catch (error) {
      console.error('[Database] Initialization failed:', error);
      // Clear any corrupted data and start fresh
      Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
      // Don't throw error, just mark as initialized to prevent blocking
      this.initialized = true;
    }
  }

  private async initializeDefaultData(): Promise<void> {
    // Initialize with sample data in memory store
    const sampleData = {
      colleges: [
        {
          id: '1',
          name: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          student_count: 45000,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Stanford University',
          location: 'Stanford, CA',
          student_count: 17000,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      students: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          college: '1',
          risk_level: 'low',
          last_assessment: new Date().toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      reports: [
        {
          id: '1',
          student_id: '1',
          type: 'feedback',
          content: 'The counseling session was very helpful.',
          status: 'pending',
          priority: 'medium',
          submitted_at: new Date().toISOString(),
          title: 'Positive Feedback',
          category: 'feedback',
          submitted_by: 'Student User'
        }
      ],
      helplines: [
        {
          id: '1',
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          description: '24/7 crisis support',
          availability: '24/7',
          category: 'crisis',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };

    // Store sample data
    for (const [table, data] of Object.entries(sampleData)) {
      if (!memoryStore[table] || memoryStore[table].length === 0) {
        memoryStore[table] = data;
      }
    }
  }

  private async getItem(key: string): Promise<any[]> {
    return memoryStore[key] || [];
  }

  private async setItem(key: string, value: any): Promise<void> {
    memoryStore[key] = value;
  }

  // Generic CRUD operations
  async findMany<T>(table: string, filter?: (item: T) => boolean): Promise<T[]> {
    const items = await this.getItem(table);
    return filter ? items.filter(filter) : items;
  }

  async findById<T extends { id: string }>(table: string, id: string): Promise<T | null> {
    const items = await this.getItem(table);
    return items.find((item: T) => item.id === id) || null;
  }

  async create<T extends { id?: string }>(table: string, data: any): Promise<T> {
    const items = await this.getItem(table);
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      id: Date.now().toString(),
      created_at: now,
      updated_at: now
    };
    
    items.push(newItem);
    await this.setItem(table, items);
    return newItem as T;
  }

  async update<T extends { id: string }>(table: string, id: string, data: Partial<T>): Promise<T | null> {
    const items = await this.getItem(table);
    const index = items.findIndex((item: T) => item.id === id);
    
    if (index === -1) return null;
    
    const updatedItem = {
      ...items[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    items[index] = updatedItem;
    await this.setItem(table, items);
    return updatedItem;
  }

  async delete(table: string, id: string): Promise<boolean> {
    const items = await this.getItem(table);
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    await this.setItem(table, items);
    return true;
  }

  async count(table: string, filter?: (item: any) => boolean): Promise<number> {
    const items = await this.getItem(table);
    return filter ? items.filter(filter).length : items.length;
  }

  async clear(table: string): Promise<void> {
    delete memoryStore[table];
  }

  async clearAll(): Promise<void> {
    Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
    this.initialized = false;
  }
}

export const db = Database.getInstance();
export default db;