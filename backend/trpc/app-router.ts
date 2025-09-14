import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { consentProcedure, getConsentedAssessmentsProcedure, revokeConsentProcedure } from "./routes/consent/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  consent: createTRPCRouter({
    submit: consentProcedure,
    getConsentedAssessments: getConsentedAssessmentsProcedure,
    revoke: revokeConsentProcedure,
  }),
});

export type AppRouter = typeof appRouter;