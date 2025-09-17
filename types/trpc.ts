// Client-side type definitions for tRPC router
// This avoids importing server code on the client

export interface AppRouter {
  example: {
    hi: {
      query: () => Promise<{ message: string }>;
    };
  };
  consent: {
    submit: {
      mutation: (input: any) => Promise<any>;
    };
    getConsentedAssessments: {
      query: () => Promise<any[]>;
    };
    revoke: {
      mutation: (input: any) => Promise<any>;
    };
  };
  counselor: {
    application: {
      submit: {
        mutation: (input: any) => Promise<any>;
      };
      getPending: {
        query: () => Promise<any[]>;
      };
      getDetails: {
        query: (input: { id: string }) => Promise<any>;
      };
      review: {
        mutation: (input: any) => Promise<any>;
      };
      uploadDocument: {
        mutation: (input: any) => Promise<any>;
      };
      checkStatus: {
        query: (input: { id: string }) => Promise<any>;
      };
      getAll: {
        query: () => Promise<any[]>;
      };
      approve: {
        mutation: (input: { id: string }) => Promise<any>;
      };
      reject: {
        mutation: (input: { id: string; reason: string }) => Promise<any>;
      };
      getStats: {
        query: () => Promise<any>;
      };
    };
  };
  resources: {
    getAll: {
      query: () => Promise<any[]>;
    };
    getById: {
      query: (input: { id: string }) => Promise<any>;
    };
    create: {
      mutation: (input: any) => Promise<any>;
    };
    update: {
      mutation: (input: any) => Promise<any>;
    };
    delete: {
      mutation: (input: { id: string }) => Promise<any>;
    };
    uploadFile: {
      mutation: (input: any) => Promise<any>;
    };
    getCategories: {
      query: () => Promise<string[]>;
    };
    getStats: {
      query: () => Promise<any>;
    };
  };
  students: {
    getAllColleges: {
      query: () => Promise<any[]>;
    };
    addCollege: {
      mutation: (input: any) => Promise<any>;
    };
    verifyCollege: {
      mutation: (input: { id: string }) => Promise<any>;
    };
    getByCollege: {
      query: (input: { collegeId: string }) => Promise<any[]>;
    };
    updateRiskLevel: {
      mutation: (input: any) => Promise<any>;
    };
    getCollegeSuggestions: {
      query: (input: { query: string }) => Promise<any[]>;
    };
    submitCollegeForReview: {
      mutation: (input: any) => Promise<any>;
    };
    getCollegeStats: {
      query: () => Promise<any>;
    };
    getRiskByColleges: {
      query: () => Promise<any>;
    };
    getStudentsByCollegesAndRiskBucket: {
      query: (input: any) => Promise<any>;
    };
  };
  chat: {
    startConversation: {
      mutation: (input: any) => Promise<any>;
    };
    sendMessage: {
      mutation: (input: any) => Promise<any>;
    };
    getMessages: {
      query: (input: { conversationId: string }) => Promise<any[]>;
    };
    endConversation: {
      mutation: (input: { conversationId: string }) => Promise<any>;
    };
    getActiveConversations: {
      query: () => Promise<any[]>;
    };
    subscribeToConversation: {
      subscription: (input: { conversationId: string }) => any;
    };
    subscribeToNotifications: {
      subscription: () => any;
    };
    markAsRead: {
      mutation: (input: any) => Promise<any>;
    };
    cleanup: {
      mutation: () => Promise<any>;
    };
  };
  assessments: {
    sync: {
      mutation: (input: any) => Promise<any>;
    };
    getStudentAssessments: {
      query: (input: { studentId: string }) => Promise<any[]>;
    };
  };
  helplines: any;
  reports: any;
  activities: any;
  volunteers: {
    getAll: {
      query: () => Promise<any[]>;
    };
    updateStatus: {
      mutation: (input: any) => Promise<any>;
    };
  };
}