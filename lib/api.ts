// API service with database connectivity
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, College, Student, Report, Resource, Conversation, Message, Assessment, Helpline } from './database';

// Initialize database lazily
let dbInitialized = false;
const ensureDbInitialized = async () => {
  if (!dbInitialized) {
    try {
      await db.initialize();
      dbInitialized = true;
      console.log('[API] Database initialized successfully');
    } catch (error) {
      console.error('[API] Database initialization failed:', error);
      // Don't throw, just log the error
    }
  }
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Database-connected API service
export const api = {
  // Students and Colleges
  students: {
    getAllColleges: {
      useQuery: (params: { search?: string; onlyVerified?: boolean; limit?: number; offset?: number }) => {
        return useQuery({
          queryKey: ['colleges', params],
          queryFn: async () => {
            await delay(300);
            let colleges = await db.findMany<College>('colleges');
            
            if (params.search) {
              colleges = colleges.filter(c => 
                c.name.toLowerCase().includes(params.search!.toLowerCase()) ||
                c.location.toLowerCase().includes(params.search!.toLowerCase())
              );
            }
            
            if (params.onlyVerified) {
              colleges = colleges.filter(c => c.is_verified);
            }
            
            if (params.limit) {
              const offset = params.offset || 0;
              colleges = colleges.slice(offset, offset + params.limit);
            }
            
            return { colleges };
          }
        });
      }
    },
    
    addCollege: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { name: string; location?: string; is_verified: boolean }) => {
            await delay(300);
            const newCollege = await db.create<College>('colleges', {
              name: data.name,
              location: data.location || '',
              student_count: 0,
              is_verified: data.is_verified
            });
            return newCollege;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colleges'] });
          }
        });
      }
    },
    
    verifyCollege: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { collegeId: string }) => {
            await delay(300);
            const updatedCollege = await db.update<College>('colleges', data.collegeId, {
              is_verified: true
            });
            return updatedCollege;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colleges'] });
          }
        });
      }
    },
    
    getByCollege: {
      useQuery: (params: { collegeId?: string; limit?: number; offset?: number }) => {
        return useQuery({
          queryKey: ['students', 'by-college', params],
          queryFn: async () => {
            await delay(300);
            let students = await db.findMany<Student>('students');
            
            if (params.collegeId) {
              students = students.filter(s => s.college === params.collegeId);
            }
            
            if (params.limit) {
              const offset = params.offset || 0;
              students = students.slice(offset, offset + params.limit);
            }
            
            return { students };
          }
        });
      }
    },
    
    getCollegeStats: {
      useQuery: () => {
        return useQuery({
          queryKey: ['students', 'college-stats'],
          queryFn: async () => {
            await delay(300);
            const totalColleges = await db.count('colleges');
            const verifiedColleges = await db.count('colleges', (c: College) => c.is_verified);
            const totalStudents = await db.count('students');
            
            return {
              totalColleges,
              verifiedColleges,
              totalStudents
            };
          }
        });
      }
    },
    
    getRiskByColleges: {
      useQuery: (params: { collegeIds?: string[]; collegeNames?: string[]; cacheKey?: string }, options?: any) => {
        return useQuery({
          queryKey: ['students', 'risk-by-colleges', params],
          queryFn: async () => {
            await delay(300);
            const students = await db.findMany<Student>('students');
            
            let filteredStudents = students;
            if (params.collegeIds?.length) {
              filteredStudents = students.filter(s => params.collegeIds!.includes(s.college));
            }
            
            const riskCounts = filteredStudents.reduce((acc, student) => {
              acc[student.risk_level] = (acc[student.risk_level] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            return {
              high: riskCounts.high || 0,
              medium: riskCounts.medium || 0,
              low: riskCounts.low || 0
            };
          },
          ...options
        });
      }
    },
    
    getStudentsByCollegesAndRiskBucket: {
      useQuery: (params: { collegeIds?: string[]; collegeNames?: string[]; bucket?: string; limit?: number; offset?: number }, options?: any) => {
        return useQuery({
          queryKey: ['students', 'by-colleges-risk', params],
          queryFn: async () => {
            await delay(300);
            let students = await db.findMany<Student>('students');
            
            if (params.collegeIds?.length) {
              students = students.filter(s => params.collegeIds!.includes(s.college));
            }
            
            if (params.bucket && params.bucket !== 'all') {
              students = students.filter(s => s.risk_level === params.bucket);
            }
            
            if (params.limit) {
              const offset = params.offset || 0;
              students = students.slice(offset, offset + params.limit);
            }
            
            return { students };
          },
          ...options
        });
      }
    }
  },



  // Reports
  reports: {
    getAll: {
      useQuery: (params: { status?: string; priority?: string; limit?: number; offset?: number }) => {
        return useQuery({
          queryKey: ['reports', params],
          queryFn: async () => {
            await delay(300);
            let reports = await db.findMany<Report>('reports');
            
            if (params.status && params.status !== 'all') {
              reports = reports.filter(r => r.status === params.status);
            }
            
            if (params.priority && params.priority !== 'all') {
              reports = reports.filter(r => r.priority === params.priority);
            }
            
            if (params.limit) {
              const offset = params.offset || 0;
              reports = reports.slice(offset, offset + params.limit);
            }
            
            return { reports };
          }
        });
      }
    },
    
    getStats: {
      useQuery: () => {
        return useQuery({
          queryKey: ['reports', 'stats'],
          queryFn: async () => {
            await delay(300);
            const total = await db.count('reports');
            const pending = await db.count('reports', (r: Report) => r.status === 'pending');
            const resolved = await db.count('reports', (r: Report) => r.status === 'resolved');
            const inProgress = await db.count('reports', (r: Report) => r.status === 'in-progress');
            
            return { total, pending, resolved, inProgress };
          }
        });
      }
    },
    
    getById: {
      useQuery: (params: { reportId?: string }, options?: any) => {
        return useQuery({
          queryKey: ['reports', params.reportId],
          queryFn: async () => {
            await delay(300);
            if (!params.reportId) return null;
            return await db.findById<Report>('reports', params.reportId);
          },
          enabled: !!params.reportId,
          ...options
        });
      }
    },
    
    review: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { reportId: string; action: string; notes?: string }) => {
            await delay(300);
            const status = data.action === 'resolve' ? 'resolved' : 'in-progress';
            const updateData: Partial<Report> = {
              status,
              notes: data.notes,
              resolved_by: 'admin@example.com'
            };
            
            if (status === 'resolved') {
              updateData.resolved_at = new Date().toISOString();
            }
            
            const updatedReport = await db.update<Report>('reports', data.reportId, updateData);
            return updatedReport;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
          },
          ...options
        });
      }
    },
    
    create: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: Omit<Report, 'id' | 'submitted_at'>) => {
            await delay(300);
            const newReport = await db.create<Report>('reports', {
              ...data,
              submitted_at: new Date().toISOString()
            });
            return newReport;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
          }
        });
      }
    }
  },

  // Resources
  resources: {
    getAll: {
      useQuery: (params: { type?: string; category?: string; limit?: number; offset?: number }) => {
        return useQuery({
          queryKey: ['resources', params],
          queryFn: async () => {
            await delay(300);
            let resources = await db.findMany<Resource>('resources');
            
            if (params.type && params.type !== 'all') {
              resources = resources.filter(r => r.type === params.type);
            }
            
            if (params.category && params.category !== 'all') {
              resources = resources.filter(r => r.category === params.category);
            }
            
            if (params.limit) {
              const offset = params.offset || 0;
              resources = resources.slice(offset, offset + params.limit);
            }
            
            return { resources };
          }
        });
      }
    },
    
    uploadFile: {
      useMutation: () => {
        return useMutation({
          mutationFn: async (data: { file: any }) => {
            await delay(1000);
            // Simulate file upload
            return { 
              url: `https://example.com/resources/${Date.now()}.pdf`, 
              id: Date.now().toString() 
            };
          }
        });
      }
    },
    
    create: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => {
            await delay(300);
            const newResource = await db.create<Resource>('resources', data);
            return newResource;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
          }
        });
      }
    },
    
    update: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { id: string; [key: string]: any }) => {
            await delay(300);
            const { id, ...updateData } = data;
            const updatedResource = await db.update<Resource>('resources', id, updateData);
            return updatedResource;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
          }
        });
      }
    },
    
    delete: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { id: string }) => {
            await delay(300);
            const success = await db.delete('resources', data.id);
            return { success };
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
          }
        });
      }
    }
  },

  // Chat
  chat: {
    getActiveConversations: {
      useQuery: (params: { userId?: string }, options?: any) => {
        return useQuery({
          queryKey: ['conversations', 'active', params],
          queryFn: async () => {
            await delay(300);
            let conversations = await db.findMany<Conversation>('conversations', 
              (c: Conversation) => c.status === 'active'
            );
            
            if (params.userId) {
              conversations = conversations.filter(c => 
                c.student_id === params.userId || c.volunteer_id === params.userId
              );
            }
            
            return { conversations };
          },
          ...options
        });
      }
    },
    
    getMessages: {
      useQuery: (params: { conversationId: string; limit?: number }, options?: any) => {
        return useQuery({
          queryKey: ['messages', params.conversationId, params.limit],
          queryFn: async () => {
            await delay(300);
            let messages = await db.findMany<Message>('messages', 
              (m: Message) => m.conversation_id === params.conversationId
            );
            
            // Sort by sent time
            messages.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
            
            if (params.limit) {
              messages = messages.slice(-params.limit);
            }
            
            return { messages };
          },
          ...options
        });
      }
    },
    
    startConversation: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { studentId: string; volunteerId?: string }) => {
            await delay(300);
            const newConversation = await db.create<Conversation>('conversations', {
              student_id: data.studentId,
              volunteer_id: data.volunteerId || '1',
              status: 'active',
              last_message: '',
              last_message_at: new Date().toISOString(),
              unread_count: 0
            });
            return newConversation;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          },
          ...options
        });
      }
    },
    
    sendMessage: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { 
            conversationId: string; 
            content: string; 
            senderId: string;
            senderType: 'student' | 'volunteer' | 'counselor' | 'admin';
            messageType?: 'text' | 'image' | 'file';
          }) => {
            await delay(300);
            
            // Create message
            const newMessage = await db.create<Message>('messages', {
              conversation_id: data.conversationId,
              sender_id: data.senderId,
              sender_type: data.senderType,
              content: data.content,
              message_type: data.messageType || 'text',
              is_read: false,
              sent_at: new Date().toISOString()
            });
            
            // Update conversation
            await db.update<Conversation>('conversations', data.conversationId, {
              last_message: data.content,
              last_message_at: new Date().toISOString(),
              unread_count: 1
            });
            
            return newMessage;
          },
          onSuccess: (data: Message) => {
            queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          },
          ...options
        });
      }
    },
    
    markAsRead: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { conversationId: string }) => {
            await delay(200);
            
            // Mark all messages as read
            const messages = await db.findMany<Message>('messages', 
              (m: Message) => m.conversation_id === data.conversationId && !m.is_read
            );
            
            for (const message of messages) {
              await db.update<Message>('messages', message.id, { is_read: true });
            }
            
            // Reset unread count
            await db.update<Conversation>('conversations', data.conversationId, {
              unread_count: 0
            });
            
            return { success: true };
          },
          onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          }
        });
      }
    }
  },

  // Assessments
  assessments: {
    getStudentAssessments: {
      useQuery: (params: { studentId?: string; limit?: number }) => {
        return useQuery({
          queryKey: ['assessments', 'student', params],
          queryFn: async () => {
            await delay(300);
            let assessments = await db.findMany<Assessment>('assessments');
            
            if (params.studentId) {
              assessments = assessments.filter(a => a.student_id === params.studentId);
            }
            
            if (params.limit) {
              assessments = assessments.slice(0, params.limit);
            }
            
            return { assessments };
          }
        });
      }
    },
    
    create: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: Omit<Assessment, 'id' | 'completed_at'>) => {
            await delay(300);
            const newAssessment = await db.create<Assessment>('assessments', {
              ...data,
              completed_at: new Date().toISOString()
            });
            return newAssessment;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
          }
        });
      }
    },
    
    sync: {
      mutate: async (data: any) => {
        await delay(300);
        // Sync assessment data
        return { success: true };
      }
    }
  },

  // Helplines
  helplines: {
    getAll: {
      useQuery: (params: { category?: string; isActive?: boolean } = {}) => {
        return useQuery({
          queryKey: ['helplines', params],
          queryFn: async () => {
            await delay(300);
            let helplines = await db.findMany<Helpline>('helplines');
            
            if (params.category) {
              helplines = helplines.filter(h => h.category === params.category);
            }
            
            if (params.isActive !== undefined) {
              helplines = helplines.filter(h => h.is_active === params.isActive);
            }
            
            return { helplines };
          }
        });
      }
    },
    
    create: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: Omit<Helpline, 'id' | 'created_at' | 'updated_at'>) => {
            await delay(300);
            const newHelpline = await db.create<Helpline>('helplines', data);
            return newHelpline;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['helplines'] });
          }
        });
      }
    },
    
    update: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { id: string; [key: string]: any }) => {
            await delay(300);
            const { id, ...updateData } = data;
            const updatedHelpline = await db.update<Helpline>('helplines', id, updateData);
            return updatedHelpline;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['helplines'] });
          }
        });
      }
    },
    
    delete: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { id: string }) => {
            await delay(300);
            const success = await db.delete('helplines', data.id);
            return { success };
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['helplines'] });
          }
        });
      }
    }
  },

  // Consent
  consent: {
    getConsentedAssessments: {
      useQuery: (params: any, options?: any) => {
        return useQuery({
          queryKey: ['consent', 'assessments'],
          queryFn: async () => {
            await delay(300);
            const assessments = await db.findMany<Assessment>('assessments');
            return { assessments };
          },
          ...options
        });
      }
    }
  },

  // Utils
  useUtils: () => {
    const queryClient = useQueryClient();
    return {
      invalidateQueries: (params: any) => queryClient.invalidateQueries(params)
    };
  }
};

// Export client for backward compatibility
export const apiClient = {
  consent: {
    getConsentedAssessments: {
      query: async (params: any) => {
        await delay(300);
        const assessments = await db.findMany<Assessment>('assessments');
        return { assessments };
      }
    }
  },
  assessments: {
    sync: {
      mutate: async (data: any) => {
        await delay(300);
        return { success: true };
      }
    }
  },
  helplines: {
    getAll: {
      query: async () => {
        await delay(300);
        const helplines = await db.findMany<Helpline>('helplines');
        return { helplines };
      }
    }
  }
};

export default api;