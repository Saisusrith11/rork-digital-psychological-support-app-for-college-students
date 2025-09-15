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
} from "./routes/counselor/application/route";

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
    }),
  }),
});

export type AppRouter = typeof appRouter;