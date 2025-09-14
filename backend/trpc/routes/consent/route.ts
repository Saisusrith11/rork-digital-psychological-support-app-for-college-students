import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

const consentSchema = z.object({
  assessmentId: z.string().min(1),
  consentGranted: z.boolean(),
  studentId: z.string().optional(),
});

const getConsentedAssessmentsSchema = z.object({
  counselorId: z.string().min(1),
});

export const consentProcedure = publicProcedure
  .input(consentSchema)
  .mutation(async ({ input }) => {
    console.log('Processing consent decision:', input);
    
    // In a real app, this would save to a database
    // For now, we'll simulate the consent processing
    const consentRecord = {
      id: Date.now().toString(),
      assessmentId: input.assessmentId,
      consentGranted: input.consentGranted,
      studentId: input.studentId || `student_${Date.now()}`,
      timestamp: new Date(),
      anonymousCode: `AN-${Math.floor(Math.random() * 9000) + 1000}`,
    };

    // Simulate database save delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      consentRecord,
      message: input.consentGranted 
        ? 'Consent granted. Your results have been shared with counselors.'
        : 'Consent denied. Your results remain private.',
    };
  });

export const getConsentedAssessmentsProcedure = publicProcedure
  .input(getConsentedAssessmentsSchema)
  .query(async ({ input }) => {
    console.log('Fetching consented assessments for counselor:', input.counselorId);
    
    // Mock data for consented assessments that counselors can see
    const mockConsentedAssessments = [
      {
        id: '1',
        anonymousCode: 'ST-2847',
        totalScore: 15,
        category: 'moderate' as const,
        completedAt: new Date('2025-09-10'),
        consentGranted: true,
        studentId: 'student_2847',
      },
      {
        id: '2',
        anonymousCode: 'AN-9321',
        totalScore: 28,
        category: 'severe' as const,
        completedAt: new Date('2025-09-12'),
        consentGranted: false,
        studentId: 'student_9321',
      },
      {
        id: '3',
        anonymousCode: 'ST-1234',
        totalScore: 8,
        category: 'minimal' as const,
        completedAt: new Date('2025-09-14'),
        consentGranted: true,
        studentId: 'student_1234',
      },
    ];

    // Filter to only show consented assessments
    const consentedOnly = mockConsentedAssessments.filter(assessment => assessment.consentGranted);

    return {
      assessments: consentedOnly,
      totalCount: consentedOnly.length,
    };
  });

export const revokeConsentProcedure = publicProcedure
  .input(z.object({
    assessmentId: z.string().min(1),
    studentId: z.string().min(1),
  }))
  .mutation(async ({ input }) => {
    console.log('Revoking consent for assessment:', input.assessmentId);
    
    // Simulate consent revocation
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      message: 'Consent has been revoked. Your data is now private.',
    };
  });