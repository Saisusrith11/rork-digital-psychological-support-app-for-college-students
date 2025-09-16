// Client-safe type definitions for tRPC
// This file defines types without importing server code to avoid bundling issues

// Define the AppRouter type structure without importing from backend
// This should match your actual backend router structure
export interface AppRouter {
  example: {
    hi: {
      query: () => string;
    };
  };
  consent: {
    getConsent: {
      query: (input: { userId: string }) => any;
    };
    updateConsent: {
      mutation: (input: { userId: string; hasConsented: boolean }) => any;
    };
  };
  counselor: {
    application: {
      submit: {
        mutation: (input: any) => any;
      };
      getAll: {
        query: () => any[];
      };
      updateStatus: {
        mutation: (input: { id: string; status: string; reviewNotes?: string }) => any;
      };
    };
  };
  resources: {
    getAll: {
      query: () => any[];
    };
    create: {
      mutation: (input: any) => any;
    };
    update: {
      mutation: (input: any) => any;
    };
    delete: {
      mutation: (input: { id: string }) => any;
    };
  };
  students: {
    getAllColleges: {
      query: (input: { search?: string; onlyVerified?: boolean; limit?: number; offset?: number }) => { colleges: any[]; total: number; hasMore: boolean };
    };
    addCollege: { mutation: (input: { name: string; location?: string; isVerified?: boolean }) => any };
    verifyCollege: { mutation: (input: { collegeId: string }) => any };
    getByCollege: {
      query: (input: { collegeId?: string; collegeName?: string; riskLevel?: 'low'|'medium'|'high'|'all'; search?: string; sortBy?: 'name'|'riskScore'|'lastActive'|'joinedAt'; sortOrder?: 'asc'|'desc'; limit?: number; offset?: number }) => { students: any[]; stats: any; total: number; hasMore: boolean };
    };
    updateRiskLevel: { mutation: (input: { studentId: string; riskScore: number }) => any };
    getCollegeSuggestions: { query: (input: { query: string }) => { suggestions: Array<{ id: string; name: string; location?: string }> } };
    submitCollegeForReview: { mutation: (input: { name: string; location?: string; submittedBy: string }) => any };
    getCollegeStats: { query: () => { collegeStats: any[]; overallStats: any } };
    getRiskByColleges: { query: (input: { collegeIds?: string[]; collegeNames?: string[]; cacheKey?: string }) => { counts: Record<'minimal'|'mild'|'moderate'|'severe', number>; total: number; includedColleges: string[]; includedCollegeNames: string[] } };
    getStudentsByCollegesAndRiskBucket: { query: (input: { collegeIds?: string[]; collegeNames?: string[]; bucket: 'minimal'|'mild'|'moderate'|'severe'; limit?: number; offset?: number }) => { students: any[]; total: number; hasMore: boolean } };
  };
  chat: {
    getMessages: {
      query: (input: { chatId: string }) => any[];
    };
    sendMessage: {
      mutation: (input: any) => any;
    };
  };
  assessments: {
    submit: {
      mutation: (input: any) => any;
    };
    getResults: {
      query: (input: { userId: string }) => any[];
    };
  };
  helplines: {
    getAll: {
      query: () => any[];
    };
    create: {
      mutation: (input: any) => any;
    };
    update: {
      mutation: (input: any) => any;
    };
    delete: {
      mutation: (input: { id: string }) => any;
    };
  };
  reports: {
    getWeeklyReport: {
      query: (input: { userId: string; startDate: string; endDate: string }) => any;
    };
  };
  activities: {
    getAll: {
      query: () => any[];
    };
    create: {
      mutation: (input: any) => any;
    };
    update: {
      mutation: (input: any) => any;
    };
    delete: {
      mutation: (input: { id: string }) => any;
    };
  };
}

// You can add more client-safe types here as needed