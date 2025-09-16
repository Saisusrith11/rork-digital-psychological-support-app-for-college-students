import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { consentProcedure, getConsentedAssessmentsProcedure, revokeConsentProcedure } from "./routes/consent/route";
import {
  submitApplicationProcedure,
  getPendingApplicationsProcedure,
  getApplicationDetailsProcedure,
  reviewApplicationProcedure,
  uploadDocumentProcedure,
  checkApplicationStatusProcedure,
  getAllApplicationsProcedure,
  approveApplicationProcedure,
  rejectApplicationProcedure,
  getApplicationStatsProcedure,
} from "./routes/counselor/application/route";
import {
  getAllResourcesProcedure,
  getResourceByIdProcedure,
  createResourceProcedure,
  updateResourceProcedure,
  deleteResourceProcedure,
  uploadResourceFileProcedure,
  getResourceCategoriesProcedure,
  getResourceStatsProcedure,
} from "./routes/resources/route";
import {
  getAllCollegesProcedure,
  addCollegeProcedure,
  verifyCollegeProcedure,
  getStudentsByCollegeProcedure,
  updateStudentRiskLevelProcedure,
  getCollegeSuggestionsProcedure,
  submitCollegeForReviewProcedure,
  getCollegeStatsProcedure,
  getRiskByCollegesProcedure,
  getStudentsByCollegesAndRiskBucketProcedure,
} from "./routes/students/route";
import {
  startConversationProcedure,
  sendMessageProcedure,
  getConversationMessagesProcedure,
  endConversationProcedure,
  getActiveConversationsProcedure,
  subscribeToConversationProcedure,
  subscribeToNotificationsProcedure,
  markMessagesAsReadProcedure,
  cleanupInactiveConversationsProcedure,
} from "./routes/chat/route";
import { syncAssessmentsProcedure, getStudentAssessmentsProcedure } from "./routes/assessments/route";
import helplinesRouter from "./routes/helplines/route";
import reportsRouter from "./routes/reports/route";
import activitiesRouter from "./routes/activities/route";
import { getAllVolunteers, updateVolunteerStatus } from "./routes/volunteers/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  consent: createTRPCRouter({
    submit: consentProcedure,
    getConsentedAssessments: getConsentedAssessmentsProcedure,
    revoke: revokeConsentProcedure,
  }),
  counselor: createTRPCRouter({
    application: createTRPCRouter({
      submit: submitApplicationProcedure,
      getPending: getPendingApplicationsProcedure,
      getDetails: getApplicationDetailsProcedure,
      review: reviewApplicationProcedure,
      uploadDocument: uploadDocumentProcedure,
      checkStatus: checkApplicationStatusProcedure,
      getAll: getAllApplicationsProcedure,
      approve: approveApplicationProcedure,
      reject: rejectApplicationProcedure,
      getStats: getApplicationStatsProcedure,
    }),
  }),
  resources: createTRPCRouter({
    getAll: getAllResourcesProcedure,
    getById: getResourceByIdProcedure,
    create: createResourceProcedure,
    update: updateResourceProcedure,
    delete: deleteResourceProcedure,
    uploadFile: uploadResourceFileProcedure,
    getCategories: getResourceCategoriesProcedure,
    getStats: getResourceStatsProcedure,
  }),
  students: createTRPCRouter({
    getAllColleges: getAllCollegesProcedure,
    addCollege: addCollegeProcedure,
    verifyCollege: verifyCollegeProcedure,
    getByCollege: getStudentsByCollegeProcedure,
    updateRiskLevel: updateStudentRiskLevelProcedure,
    getCollegeSuggestions: getCollegeSuggestionsProcedure,
    submitCollegeForReview: submitCollegeForReviewProcedure,
    getCollegeStats: getCollegeStatsProcedure,
    getRiskByColleges: getRiskByCollegesProcedure,
    getStudentsByCollegesAndRiskBucket: getStudentsByCollegesAndRiskBucketProcedure,
  }),
  chat: createTRPCRouter({
    startConversation: startConversationProcedure,
    sendMessage: sendMessageProcedure,
    getMessages: getConversationMessagesProcedure,
    endConversation: endConversationProcedure,
    getActiveConversations: getActiveConversationsProcedure,
    subscribeToConversation: subscribeToConversationProcedure,
    subscribeToNotifications: subscribeToNotificationsProcedure,
    markAsRead: markMessagesAsReadProcedure,
    cleanup: cleanupInactiveConversationsProcedure,
  }),
  assessments: createTRPCRouter({
    sync: syncAssessmentsProcedure,
    getStudentAssessments: getStudentAssessmentsProcedure,
  }),
  helplines: helplinesRouter,
  reports: reportsRouter,
  activities: activitiesRouter,
  volunteers: createTRPCRouter({
    getAll: getAllVolunteers,
    updateStatus: updateVolunteerStatus,
  }),
});

export type AppRouter = typeof appRouter;