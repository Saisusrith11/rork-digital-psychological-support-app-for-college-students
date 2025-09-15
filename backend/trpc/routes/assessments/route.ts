import { z } from 'zod';
import { publicProcedure } from '../../create-context';

const assessmentSyncItemSchema = z.object({
  id: z.string(),
  studentId: z.string().optional(),
  totalScore: z.number(),
  category: z.enum(['minimal','mild','moderate','severe']),
  completedAt: z.string(),
});

export const syncAssessmentsProcedure = publicProcedure
  .input(z.object({ items: z.array(assessmentSyncItemSchema) }))
  .mutation(async ({ input }) => {
    console.log('[trpc.assessments.sync] received', input.items.length);
    const syncedIds = input.items.map((i) => i.id);
    return { success: true as const, syncedIds };
  });

export default syncAssessmentsProcedure;
