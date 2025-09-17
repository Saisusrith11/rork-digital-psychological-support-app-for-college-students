// TRPC replacement using React Query and existing API client
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock college data for development
const mockColleges = [
  { id: '1', name: 'University of California, Berkeley', location: 'Berkeley, CA', studentCount: 45000, isVerified: true },
  { id: '2', name: 'Stanford University', location: 'Stanford, CA', studentCount: 17000, isVerified: true },
  { id: '3', name: 'Harvard University', location: 'Cambridge, MA', studentCount: 23000, isVerified: true },
  { id: '4', name: 'MIT', location: 'Cambridge, MA', studentCount: 11500, isVerified: true },
  { id: '5', name: 'Community College of Denver', location: 'Denver, CO', studentCount: 8500, isVerified: false },
];

const mockApplications = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    specialization: 'Clinical Psychology',
    experience: '8 years',
    status: 'pending',
    submittedAt: new Date('2024-01-15').toISOString(),
    documents: ['license.pdf', 'cv.pdf']
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0124',
    specialization: 'Cognitive Behavioral Therapy',
    experience: '12 years',
    status: 'approved',
    submittedAt: new Date('2024-01-10').toISOString(),
    documents: ['license.pdf', 'cv.pdf', 'references.pdf']
  }
];

const mockStudents = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex.t@university.edu',
    college: 'University of California, Berkeley',
    riskLevel: 'medium',
    lastAssessment: new Date('2024-01-20').toISOString(),
    status: 'active'
  },
  {
    id: '2',
    name: 'Jamie Rodriguez',
    email: 'jamie.r@stanford.edu',
    college: 'Stanford University',
    riskLevel: 'low',
    lastAssessment: new Date('2024-01-18').toISOString(),
    status: 'active'
  }
];

const mockActivities = [
  {
    id: '1',
    title: 'Mindfulness Meditation',
    description: 'A guided meditation session to help reduce stress and anxiety',
    type: 'wellness',
    duration: 15,
    riskLevel: 'all',
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    title: 'Breathing Exercise',
    description: 'Simple breathing techniques for immediate stress relief',
    type: 'exercise',
    duration: 5,
    riskLevel: 'high',
    createdAt: new Date('2024-01-14').toISOString()
  }
];

const mockReports = [
  {
    id: '1',
    studentId: '1',
    type: 'crisis',
    content: 'Student reported feeling overwhelmed with coursework',
    status: 'pending',
    priority: 'high',
    submittedAt: new Date('2024-01-20').toISOString()
  }
];

const mockResources = [
  {
    id: '1',
    title: 'Mental Health First Aid Guide',
    description: 'A comprehensive guide for recognizing mental health issues',
    type: 'document',
    url: 'https://example.com/guide.pdf',
    category: 'education',
    createdAt: new Date('2024-01-15').toISOString()
  }
];

const mockVolunteers = [
  {
    id: '1',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    status: 'active',
    specialization: 'Peer Support',
    joinedAt: new Date('2024-01-10').toISOString()
  }
];

const mockConversations = [
  {
    id: '1',
    studentId: '1',
    volunteerId: '1',
    lastMessage: 'How are you feeling today?',
    lastMessageAt: new Date('2024-01-20').toISOString(),
    unreadCount: 2
  }
];

const mockMessages = [
  {
    id: '1',
    conversationId: '1',
    senderId: '1',
    senderType: 'volunteer',
    content: 'Hello! How can I help you today?',
    sentAt: new Date('2024-01-20T10:00:00').toISOString()
  },
  {
    id: '2',
    conversationId: '1',
    senderId: '1',
    senderType: 'student',
    content: 'I\'ve been feeling really stressed about my exams.',
    sentAt: new Date('2024-01-20T10:05:00').toISOString()
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// TRPC-like API object
export const trpc = {
  // Students
  students: {
    getAllColleges: {
      useQuery: (params: { search?: string; onlyVerified?: boolean; limit?: number; offset?: number }) => {
        return useQuery({
          queryKey: ['colleges', params],
          queryFn: async () => {
            await delay(500);
            let colleges = [...mockColleges];
            if (params.search) {
              colleges = colleges.filter(c => 
                c.name.toLowerCase().includes(params.search!.toLowerCase()) ||
                c.location.toLowerCase().includes(params.search!.toLowerCase())
              );
            }
            if (params.onlyVerified) {
              colleges = colleges.filter(c => c.isVerified);
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
          mutationFn: async (data: { name: string; location?: string; isVerified: boolean }) => {
            await delay(500);
            const newCollege = {
              id: Date.now().toString(),
              name: data.name,
              location: data.location || '',
              studentCount: 0,
              isVerified: data.isVerified
            };
            mockColleges.push(newCollege);
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
            await delay(500);
            const college = mockColleges.find(c => c.id === data.collegeId);
            if (college) {
              college.isVerified = true;
            }
            return college;
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
            await delay(500);
            return { students: mockStudents };
          }
        });
      }
    },
    getCollegeStats: {
      useQuery: () => {
        return useQuery({
          queryKey: ['students', 'college-stats'],
          queryFn: async () => {
            await delay(500);
            return {
              totalColleges: mockColleges.length,
              verifiedColleges: mockColleges.filter(c => c.isVerified).length,
              totalStudents: mockStudents.length
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
            await delay(500);
            return {
              high: 5,
              medium: 12,
              low: 23
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
            await delay(500);
            return { students: mockStudents };
          },
          ...options
        });
      }
    }
  },

  // Counselor applications
  counselor: {
    application: {
      getAll: {
        useQuery: (params: { status?: string; limit?: number; offset?: number }) => {
          return useQuery({
            queryKey: ['counselor-applications', params],
            queryFn: async () => {
              await delay(500);
              let applications = [...mockApplications];
              if (params.status && params.status !== 'all') {
                applications = applications.filter(a => a.status === params.status);
              }
              return { applications };
            }
          });
        }
      },
      getStats: {
        useQuery: () => {
          return useQuery({
            queryKey: ['counselor-applications', 'stats'],
            queryFn: async () => {
              await delay(500);
              return {
                total: mockApplications.length,
                pending: mockApplications.filter(a => a.status === 'pending').length,
                approved: mockApplications.filter(a => a.status === 'approved').length,
                rejected: mockApplications.filter(a => a.status === 'rejected').length
              };
            }
          });
        }
      },
      approve: {
        useMutation: (options?: any) => {
          const queryClient = useQueryClient();
          return useMutation({
            mutationFn: async (data: { applicationId: string; feedback?: string }) => {
              await delay(500);
              const application = mockApplications.find(a => a.id === data.applicationId);
              if (application) {
                application.status = 'approved';
              }
              return application;
            },
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['counselor-applications'] });
            },
            ...options
          });
        }
      },
      reject: {
        useMutation: (options?: any) => {
          const queryClient = useQueryClient();
          return useMutation({
            mutationFn: async (data: { applicationId: string; feedback?: string }) => {
              await delay(500);
              const application = mockApplications.find(a => a.id === data.applicationId);
              if (application) {
                application.status = 'rejected';
              }
              return application;
            },
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['counselor-applications'] });
            },
            ...options
          });
        }
      },
      uploadDocument: {
        useMutation: () => {
          return useMutation({
            mutationFn: async (data: { file: any; type: string }) => {
              await delay(1000);
              return { url: 'https://example.com/document.pdf', id: Date.now().toString() };
            }
          });
        }
      },
      submit: {
        useMutation: () => {
          return useMutation({
            mutationFn: async (data: any) => {
              await delay(1000);
              return { success: true, applicationId: Date.now().toString() };
            }
          });
        }
      }
    }
  },

  // Activities
  activities: {
    getAll: {
      useQuery: (params: { riskLevel?: string; limit?: number }) => {
        return useQuery({
          queryKey: ['activities', params],
          queryFn: async () => {
            await delay(500);
            let activities = [...mockActivities];
            if (params.riskLevel && params.riskLevel !== 'all') {
              activities = activities.filter(a => a.riskLevel === params.riskLevel || a.riskLevel === 'all');
            }
            return { activities };
          }
        });
      }
    },
    create: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: any) => {
            await delay(500);
            const newActivity = {
              id: Date.now().toString(),
              ...data,
              createdAt: new Date().toISOString()
            };
            mockActivities.push(newActivity);
            return newActivity;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
          },
          ...options
        });
      }
    },
    update: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { id: string; [key: string]: any }) => {
            await delay(500);
            const activity = mockActivities.find(a => a.id === data.id);
            if (activity) {
              Object.assign(activity, data);
            }
            return activity;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
          },
          ...options
        });
      }
    },
    delete: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { id: string }) => {
            await delay(500);
            const index = mockActivities.findIndex(a => a.id === data.id);
            if (index > -1) {
              mockActivities.splice(index, 1);
            }
            return { success: true };
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
          },
          ...options
        });
      }
    }
  },

  // Reports
  reports: {
    getAll: {
      useQuery: (params: any) => {
        return useQuery({
          queryKey: ['reports', params],
          queryFn: async () => {
            await delay(500);
            return { reports: mockReports };
          }
        });
      }
    },
    getStats: {
      useQuery: () => {
        return useQuery({
          queryKey: ['reports', 'stats'],
          queryFn: async () => {
            await delay(500);
            return {
              total: mockReports.length,
              pending: mockReports.filter(r => r.status === 'pending').length,
              resolved: mockReports.filter(r => r.status === 'resolved').length
            };
          }
        });
      }
    },
    getById: {
      useQuery: (params: { reportId?: string }, options?: any) => {
        return useQuery({
          queryKey: ['reports', params.reportId],
          queryFn: async () => {
            await delay(500);
            return mockReports.find(r => r.id === params.reportId);
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
            await delay(500);
            const report = mockReports.find(r => r.id === data.reportId);
            if (report) {
              report.status = data.action === 'resolve' ? 'resolved' : 'pending';
            }
            return report;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
          },
          ...options
        });
      }
    }
  },

  // Resources
  resources: {
    getAll: {
      useQuery: (params: { type?: string; limit?: number; offset?: number }) => {
        return useQuery({
          queryKey: ['resources', params],
          queryFn: async () => {
            await delay(500);
            return { resources: mockResources };
          }
        });
      }
    },
    uploadFile: {
      useMutation: () => {
        return useMutation({
          mutationFn: async (data: { file: any }) => {
            await delay(1000);
            return { url: 'https://example.com/uploaded-file.pdf', id: Date.now().toString() };
          }
        });
      }
    },
    create: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: any) => {
            await delay(500);
            const newResource = {
              id: Date.now().toString(),
              ...data,
              createdAt: new Date().toISOString()
            };
            mockResources.push(newResource);
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
            await delay(500);
            const resource = mockResources.find(r => r.id === data.id);
            if (resource) {
              Object.assign(resource, data);
            }
            return resource;
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
            await delay(500);
            const index = mockResources.findIndex(r => r.id === data.id);
            if (index > -1) {
              mockResources.splice(index, 1);
            }
            return { success: true };
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
          }
        });
      }
    }
  },

  // Volunteers
  volunteers: {
    getAll: {
      useQuery: () => {
        return useQuery({
          queryKey: ['volunteers'],
          queryFn: async () => {
            await delay(500);
            return { volunteers: mockVolunteers };
          }
        });
      }
    },
    updateStatus: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { id: string; status: string }) => {
            await delay(500);
            const volunteer = mockVolunteers.find(v => v.id === data.id);
            if (volunteer) {
              volunteer.status = data.status;
            }
            return volunteer;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['volunteers'] });
          },
          ...options
        });
      }
    }
  },

  // Chat
  chat: {
    getActiveConversations: {
      useQuery: (params: any, options?: any) => {
        return useQuery({
          queryKey: ['conversations', 'active'],
          queryFn: async () => {
            await delay(500);
            return { conversations: mockConversations };
          },
          ...options
        });
      }
    },
    getMessages: {
      useQuery: (params: { conversationId: string; limit?: number }, options?: any) => {
        return useQuery({
          queryKey: ['messages', params.conversationId],
          queryFn: async () => {
            await delay(500);
            return { messages: mockMessages.filter(m => m.conversationId === params.conversationId) };
          },
          ...options
        });
      }
    },
    startConversation: {
      useMutation: (options?: any) => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: { studentId: string }) => {
            await delay(500);
            const newConversation = {
              id: Date.now().toString(),
              studentId: data.studentId,
              volunteerId: '1',
              lastMessage: '',
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0
            };
            mockConversations.push(newConversation);
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
          mutationFn: async (data: { conversationId: string; content: string; senderType: string }) => {
            await delay(500);
            const newMessage = {
              id: Date.now().toString(),
              conversationId: data.conversationId,
              senderId: '1',
              senderType: data.senderType,
              content: data.content,
              sentAt: new Date().toISOString()
            };
            mockMessages.push(newMessage);
            return newMessage;
          },
          onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          },
          ...options
        });
      }
    },
    markAsRead: {
      useMutation: () => {
        return useMutation({
          mutationFn: async (data: { conversationId: string }) => {
            await delay(200);
            return { success: true };
          }
        });
      }
    }
  },

  // Assessments
  assessments: {
    getStudentAssessments: {
      useQuery: (params: { limit?: number }) => {
        return useQuery({
          queryKey: ['assessments', 'student', params],
          queryFn: async () => {
            await delay(500);
            return { assessments: [] };
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
            await delay(500);
            return { assessments: [] };
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

// Export trpcClient for backward compatibility
export const trpcClient = {
  consent: {
    getConsentedAssessments: {
      query: async (params: any) => {
        await delay(500);
        return { assessments: [] };
      }
    }
  },
  assessments: {
    sync: {
      mutate: async (data: any) => {
        await delay(500);
        return { success: true };
      }
    }
  },
  helplines: {
    getAll: {
      query: async () => {
        await delay(500);
        return { helplines: [] };
      }
    }
  }
};