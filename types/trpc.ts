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
    getAll: {
      query: () => any[];
    };
    getById: {
      query: (input: { id: string }) => any;
    };
    update: {
      mutation: (input: any) => any;
    };
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