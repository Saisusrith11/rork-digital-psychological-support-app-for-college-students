import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '@/backend/trpc/create-context';

type Report = {
  id: string;
  title: string;
  content: string;
  category: 'bug' | 'feature' | 'feedback' | 'safety' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminComments?: string;
  attachments?: string[];
  isAnonymous: boolean;
};

// Mock data store
let reports: Report[] = [
  {
    id: '1',
    title: 'App crashes when opening resources',
    content: 'The app consistently crashes when I try to open the resources section. This happens on both Android and iOS devices.',
    category: 'bug',
    priority: 'high',
    status: 'pending',
    submittedBy: 'Anonymous User',
    submittedAt: new Date('2024-01-15T10:30:00Z'),
    isAnonymous: true,
    attachments: ['crash_log.txt']
  },
  {
    id: '2',
    title: 'Request for dark mode feature',
    content: 'It would be great to have a dark mode option for better usability during night time study sessions.',
    category: 'feature',
    priority: 'medium',
    status: 'pending',
    submittedBy: 'Student #4521',
    submittedAt: new Date('2024-01-14T15:45:00Z'),
    isAnonymous: true
  },
  {
    id: '3',
    title: 'Inappropriate content in community forum',
    content: 'There is a post in the community forum that contains inappropriate language and could be harmful to other students.',
    category: 'safety',
    priority: 'critical',
    status: 'pending',
    submittedBy: 'Anonymous Reporter',
    submittedAt: new Date('2024-01-16T09:15:00Z'),
    isAnonymous: true
  },
  {
    id: '4',
    title: 'Assessment results not saving',
    content: 'Completed the PHQ-9 assessment but the results are not being saved to my profile.',
    category: 'bug',
    priority: 'high',
    status: 'approved',
    submittedBy: 'Student #7832',
    submittedAt: new Date('2024-01-10T14:20:00Z'),
    reviewedBy: 'admin-1',
    reviewedAt: new Date('2024-01-11T09:00:00Z'),
    adminComments: 'Confirmed bug. Development team notified.',
    isAnonymous: true
  }
];

export const getAllReportsProcedure = protectedProcedure
  .input(z.object({
    status: z.enum(['all', 'pending', 'approved', 'rejected']).optional().default('all'),
    category: z.enum(['all', 'bug', 'feature', 'feedback', 'safety', 'other']).optional().default('all'),
    priority: z.enum(['all', 'low', 'medium', 'high', 'critical']).optional().default('all')
  }))
  .query(({ input }) => {
    let filteredReports = reports;
    
    if (input.status !== 'all') {
      filteredReports = filteredReports.filter(report => report.status === input.status);
    }
    
    if (input.category !== 'all') {
      filteredReports = filteredReports.filter(report => report.category === input.category);
    }
    
    if (input.priority !== 'all') {
      filteredReports = filteredReports.filter(report => report.priority === input.priority);
    }
    
    return filteredReports.sort((a, b) => {
      // Sort by priority first (critical > high > medium > low)
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by submission date (newest first)
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  });

export const getReportByIdProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const report = reports.find(r => r.id === input.id);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  });

export const submitReportProcedure = protectedProcedure
  .input(z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(2000),
    category: z.enum(['bug', 'feature', 'feedback', 'safety', 'other']),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
    isAnonymous: z.boolean().optional().default(true),
    attachments: z.array(z.string()).optional()
  }))
  .mutation(({ input, ctx }) => {
    const newReport: Report = {
      id: Date.now().toString(),
      title: input.title,
      content: input.content,
      category: input.category,
      priority: input.priority,
      status: 'pending',
      submittedBy: input.isAnonymous ? 'Anonymous User' : ctx.user?.email || 'Unknown User',
      submittedAt: new Date(),
      isAnonymous: input.isAnonymous,
      attachments: input.attachments
    };
    
    reports.push(newReport);
    return newReport;
  });

export const reviewReportProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    action: z.enum(['approve', 'reject']),
    adminComments: z.string().optional()
  }))
  .mutation(({ input, ctx }) => {
    const reportIndex = reports.findIndex(r => r.id === input.id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const report = reports[reportIndex];
    report.status = input.action === 'approve' ? 'approved' : 'rejected';
    report.reviewedBy = ctx.user?.id || 'admin';
    report.reviewedAt = new Date();
    report.adminComments = input.adminComments;
    
    reports[reportIndex] = report;
    return report;
  });

export const getReportStatsProcedure = protectedProcedure
  .query(() => {
    const stats = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
      byCategory: {
        bug: reports.filter(r => r.category === 'bug').length,
        feature: reports.filter(r => r.category === 'feature').length,
        feedback: reports.filter(r => r.category === 'feedback').length,
        safety: reports.filter(r => r.category === 'safety').length,
        other: reports.filter(r => r.category === 'other').length
      },
      byPriority: {
        critical: reports.filter(r => r.priority === 'critical').length,
        high: reports.filter(r => r.priority === 'high').length,
        medium: reports.filter(r => r.priority === 'medium').length,
        low: reports.filter(r => r.priority === 'low').length
      }
    };
    
    return stats;
  });

const reportsRouter = createTRPCRouter({
  getAll: getAllReportsProcedure,
  getById: getReportByIdProcedure,
  submit: submitReportProcedure,
  review: reviewReportProcedure,
  getStats: getReportStatsProcedure
});

export default reportsRouter;