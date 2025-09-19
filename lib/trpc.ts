// tRPC compatibility layer using existing API service
import { api, apiClient } from './api';

// Create a trpc-like interface that uses our existing API service
export const trpc = {
  // Students
  students: {
    getAllColleges: api.students.getAllColleges,
    addCollege: api.students.addCollege,
    verifyCollege: api.students.verifyCollege,
    getByCollege: api.students.getByCollege,
    getCollegeStats: api.students.getCollegeStats,
    getRiskByColleges: api.students.getRiskByColleges,
    getStudentsByCollegesAndRiskBucket: api.students.getStudentsByCollegesAndRiskBucket
  },
  
  // Counselor
  counselor: {
    application: {
      getAll: api.counselor.application.getAll,
      getStats: api.counselor.application.getStats,
      approve: api.counselor.application.approve,
      reject: api.counselor.application.reject,
      uploadDocument: api.counselor.application.uploadDocument,
      submit: api.counselor.application.submit
    }
  },
  
  // Activities
  activities: {
    getAll: api.activities.getAll,
    create: api.activities.create,
    update: api.activities.update,
    delete: api.activities.delete
  },
  
  // Reports
  reports: {
    getAll: api.reports.getAll,
    getStats: api.reports.getStats,
    getById: api.reports.getById,
    review: api.reports.review,
    create: api.reports.create
  },
  
  // Resources
  resources: {
    getAll: api.resources.getAll,
    uploadFile: api.resources.uploadFile,
    create: api.resources.create,
    update: api.resources.update,
    delete: api.resources.delete
  },
  
  // Chat
  chat: {
    getActiveConversations: api.chat.getActiveConversations,
    getMessages: api.chat.getMessages,
    startConversation: api.chat.startConversation,
    sendMessage: api.chat.sendMessage,
    markAsRead: api.chat.markAsRead
  },
  
  // Assessments
  assessments: {
    getStudentAssessments: api.assessments.getStudentAssessments,
    create: api.assessments.create,
    sync: api.assessments.sync
  },
  
  // Helplines
  helplines: {
    getAll: api.helplines.getAll,
    create: api.helplines.create,
    update: api.helplines.update,
    delete: api.helplines.delete
  },
  
  // Consent
  consent: {
    getConsentedAssessments: api.consent.getConsentedAssessments
  },
  
  // Utils
  useUtils: api.useUtils
};

// Export client for backward compatibility
export const trpcClient = apiClient;

// Default export
export default trpc;