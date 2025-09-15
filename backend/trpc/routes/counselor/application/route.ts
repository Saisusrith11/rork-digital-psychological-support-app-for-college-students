import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '@/backend/trpc/create-context';
import type { CounselorApplication, CounselorDocument } from '@/types/user';

// Mock storage for applications (in production, use a database)
const applications: CounselorApplication[] = [];
const documents: CounselorDocument[] = [];

const DocumentSchema = z.object({
  type: z.enum(['degree_certificate', 'transcripts', 'rci_registration', 'professional_registration', 'experience_letter', 'training_certificate', 'government_id', 'cv', 'reference_contact']),
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
});

const ApplicationSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(10),
    dateOfBirth: z.string(),
  }),
  professionalInfo: z.object({
    specialization: z.array(z.string()).min(1),
    experience: z.string().min(10),
    languages: z.array(z.string()).min(1),
    currentEmployment: z.string().optional(),
  }),
  documents: z.array(DocumentSchema).min(4), // Minimum required documents
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Terms and conditions must be accepted"
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "Privacy policy must be accepted"
  }),
});

// Submit counselor application
export const submitApplicationProcedure = publicProcedure
  .input(ApplicationSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[CounselorApplication] Submitting application:', input.personalInfo.email);
      
      // Check if application already exists for this email
      const existingApplication = applications.find(
        app => app.personalInfo.email === input.personalInfo.email
      );
      
      if (existingApplication) {
        throw new Error('Application already submitted for this email');
      }
      
      // Create application
      const application: CounselorApplication = {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        counselorId: `counselor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        personalInfo: input.personalInfo,
        professionalInfo: input.professionalInfo,
        documents: input.documents.map(doc => ({
          ...doc,
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          uploadedAt: new Date().toISOString(),
        })),
        termsAccepted: input.termsAccepted,
        privacyAccepted: input.privacyAccepted,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      
      applications.push(application);
      
      console.log('[CounselorApplication] Application submitted successfully:', application.id);
      
      return {
        success: true,
        applicationId: application.id,
        message: 'Application submitted successfully. You will receive an email notification once reviewed.',
      };
    } catch (error) {
      console.error('[CounselorApplication] Error submitting application:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to submit application');
    }
  });

// Get pending applications (Admin only)
export const getPendingApplicationsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      // In production, verify admin role from ctx.user
      console.log('[CounselorApplication] Fetching pending applications');
      
      const pendingApplications = applications.filter(app => app.status === 'pending');
      
      return {
        applications: pendingApplications,
        count: pendingApplications.length,
      };
    } catch (error) {
      console.error('[CounselorApplication] Error fetching applications:', error);
      throw new Error('Failed to fetch applications');
    }
  });

// Get application details (Admin only)
export const getApplicationDetailsProcedure = protectedProcedure
  .input(z.object({ applicationId: z.string() }))
  .query(async ({ input, ctx }) => {
    try {
      console.log('[CounselorApplication] Fetching application details:', input.applicationId);
      
      const application = applications.find(app => app.id === input.applicationId);
      
      if (!application) {
        throw new Error('Application not found');
      }
      
      return application;
    } catch (error) {
      console.error('[CounselorApplication] Error fetching application details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch application details');
    }
  });

// Review application (Admin only)
export const reviewApplicationProcedure = protectedProcedure
  .input(z.object({
    applicationId: z.string(),
    action: z.enum(['approve', 'reject']),
    adminNotes: z.string().optional(),
    rejectionReason: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[CounselorApplication] Reviewing application:', input.applicationId, input.action);
      
      const applicationIndex = applications.findIndex(app => app.id === input.applicationId);
      
      if (applicationIndex === -1) {
        throw new Error('Application not found');
      }
      
      const application = applications[applicationIndex];
      
      // Update application status
      applications[applicationIndex] = {
        ...application,
        status: input.action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: ctx.user?.id || 'admin',
        adminNotes: input.adminNotes,
        rejectionReason: input.action === 'reject' ? input.rejectionReason : undefined,
      };
      
      // In production, send email notification to counselor
      console.log(`[CounselorApplication] Application ${input.action}ed:`, application.personalInfo.email);
      
      return {
        success: true,
        message: `Application ${input.action}ed successfully`,
        application: applications[applicationIndex],
      };
    } catch (error) {
      console.error('[CounselorApplication] Error reviewing application:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to review application');
    }
  });

// Upload document (for application)
export const uploadDocumentProcedure = publicProcedure
  .input(z.object({
    type: z.enum(['degree_certificate', 'transcripts', 'rci_registration', 'professional_registration', 'experience_letter', 'training_certificate', 'government_id', 'cv', 'reference_contact']),
    fileName: z.string(),
    fileData: z.string(), // Base64 encoded file data
    mimeType: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('[CounselorApplication] Uploading document:', input.fileName);
      
      // In production, upload to secure cloud storage (AWS S3, etc.)
      // For now, simulate file upload
      const fileUrl = `https://secure-storage.example.com/counselor-docs/${Date.now()}_${input.fileName}`;
      const fileSize = Math.floor(input.fileData.length * 0.75); // Approximate size from base64
      
      const document: CounselorDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: input.type,
        fileName: input.fileName,
        fileUrl,
        uploadedAt: new Date().toISOString(),
        fileSize,
        mimeType: input.mimeType,
      };
      
      documents.push(document);
      
      console.log('[CounselorApplication] Document uploaded successfully:', document.id);
      
      return {
        success: true,
        document,
      };
    } catch (error) {
      console.error('[CounselorApplication] Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  });

// Check application status
export const checkApplicationStatusProcedure = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .query(async ({ input }) => {
    try {
      console.log('[CounselorApplication] Checking application status:', input.email);
      
      const application = applications.find(
        app => app.personalInfo.email === input.email
      );
      
      if (!application) {
        return {
          hasApplication: false,
          status: null,
        };
      }
      
      return {
        hasApplication: true,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
      };
    } catch (error) {
      console.error('[CounselorApplication] Error checking application status:', error);
      throw new Error('Failed to check application status');
    }
  });

// Get all applications with filters (Admin only)
export const getAllApplicationsProcedure = protectedProcedure
  .input(z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'all']).default('all'),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input, ctx }) => {
    try {
      console.log('[CounselorApplication] Fetching all applications with filters:', input);
      
      let filteredApplications = applications;
      
      if (input.status !== 'all') {
        filteredApplications = applications.filter(app => app.status === input.status);
      }
      
      // Sort by submission date (newest first)
      filteredApplications.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      
      const paginatedApplications = filteredApplications.slice(
        input.offset,
        input.offset + input.limit
      );
      
      return {
        applications: paginatedApplications,
        total: filteredApplications.length,
        hasMore: input.offset + input.limit < filteredApplications.length,
      };
    } catch (error) {
      console.error('[CounselorApplication] Error fetching applications:', error);
      throw new Error('Failed to fetch applications');
    }
  });