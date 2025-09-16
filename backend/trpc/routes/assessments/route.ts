import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../create-context';

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

// Mock assessment data for students
const mockAssessments = [
  { studentId: '1', score: 8, category: 'minimal' as const, date: '2025-09-01' },
  { studentId: '2', score: 15, category: 'mild' as const, date: '2025-09-10' },
  { studentId: '3', score: 28, category: 'moderate' as const, date: '2025-09-12' },
  { studentId: '4', score: 35, category: 'severe' as const, date: '2025-09-14' },
];

export const getStudentAssessmentsProcedure = protectedProcedure
  .input(z.object({ 
    studentId: z.string().optional(),
    limit: z.number().optional().default(10)
  }))
  .query(async ({ input, ctx }) => {
    // Filter assessments based on studentId if provided
    let assessments = mockAssessments;
    if (input.studentId) {
      assessments = assessments.filter(a => a.studentId === input.studentId);
    }
    
    // Return limited results
    return {
      assessments: assessments.slice(0, input.limit),
      total: assessments.length
    };
  });

export default syncAssessmentsProcedure;
