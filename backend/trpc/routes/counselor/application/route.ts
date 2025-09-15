import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '@/backend/trpc/create-context';
import type { CounselorApplication, CounselorDocument } from '@/types/user';

// Email service for sending notifications
class EmailService {
  static async sendApprovalEmail(counselorEmail: string, counselorName: string): Promise<boolean> {
    try {
      console.log('[EmailService] Sending approval email to:', counselorEmail);
      
      // Generate temporary login credentials
      const tempPassword = this.generateTempPassword();
      
      // In production, use a proper email service like SendGrid, AWS SES, etc.
      // For now, we'll simulate the email sending
      const emailContent = {
        to: counselorEmail,
        subject: 'Counselor Application Approved - Welcome to Mental Health Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Congratulations! Your Application Has Been Approved</h2>
            
            <p>Dear ${counselorName},</p>
            
            <p>We are pleased to inform you that your counselor application has been approved. Welcome to our Mental Health Platform!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${counselorEmail}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              <p style="color: #dc2626; font-size: 14px;"><em>Please change your password after your first login for security purposes.</em></p>
            </div>
            
            <p>You now have access to:</p>
            <ul>
              <li>Professional counselor dashboard</li>
              <li>Student appointment management</li>
              <li>Secure messaging system</li>
              <li>Resource assignment tools</li>
            </ul>
            
            <p>To get started, please log in to your counselor portal and complete your profile setup.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            Mental Health Platform Team</p>
          </div>
        `
      };
      
      // Simulate email sending (replace with actual email service)
      await this.simulateEmailSend(emailContent);
      
      console.log('[EmailService] Approval email sent successfully to:', counselorEmail);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send approval email:', error);
      return false;
    }
  }
  
  static async sendRejectionEmail(counselorEmail: string, counselorName: string, rejectionReason: string): Promise<boolean> {
    try {
      console.log('[EmailService] Sending rejection email to:', counselorEmail);
      
      const emailContent = {
        to: counselorEmail,
        subject: 'Counselor Application Update - Mental Health Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Application Status Update</h2>
            
            <p>Dear ${counselorName},</p>
            
            <p>Thank you for your interest in joining our Mental Health Platform as a counselor. After careful review of your application, we regret to inform you that we cannot approve your application at this time.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection:</h3>
              <p style="margin-bottom: 0;">${rejectionReason}</p>
            </div>
            
            <p>Please note:</p>
            <ul>
              <li>Your submitted documents will be securely deleted from our servers after 30 days</li>
              <li>You may reapply in the future once the mentioned issues are resolved</li>
              <li>If you believe this decision was made in error, please contact our support team</li>
            </ul>
            
            <p>We appreciate your understanding and encourage you to address the mentioned concerns and consider reapplying in the future.</p>
            
            <p>Best regards,<br>
            Mental Health Platform Team</p>
          </div>
        `
      };
      
      // Simulate email sending (replace with actual email service)
      await this.simulateEmailSend(emailContent);
      
      console.log('[EmailService] Rejection email sent successfully to:', counselorEmail);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send rejection email:', error);
      return false;
    }
  }
  
  private static generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  private static async simulateEmailSend(emailContent: any): Promise<void> {
    // In production, replace this with actual email service integration
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailContent);
    
    // For now, simulate email sending with detailed logging
    console.log('\n=== EMAIL NOTIFICATION ===');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Content Preview:', emailContent.html.substring(0, 200) + '...');
    console.log('=========================\n');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you would:
    // 1. Use environment variables for email service credentials
    // 2. Handle email service errors properly
    // 3. Implement retry logic for failed sends
    // 4. Log email delivery status
    // 5. Store email history in database
  }
}

// Mock storage for applications (in production, use a database)
const applications: CounselorApplication[] = [
  {
    id: '1',
    counselorId: 'counselor_1',
    personalInfo: {
      fullName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1234567890',
      address: '123 Main St, City, State',
      dateOfBirth: '1985-06-15',
    },
    professionalInfo: {
      specialization: ['Anxiety Disorders', 'Depression'],
      experience: '5 years of clinical experience in mental health counseling with focus on cognitive behavioral therapy and mindfulness-based interventions.',
      languages: ['English', 'Spanish'],
      currentEmployment: 'Private Practice',
    },
    documents: [
      {
        id: 'doc_1',
        type: 'degree_certificate',
        fileName: 'masters_degree.pdf',
        fileUrl: 'https://example.com/doc1.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'doc_2',
        type: 'government_id',
        fileName: 'government_id.pdf',
        fileUrl: 'https://example.com/doc2.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
      },
    ],
    termsAccepted: true,
    privacyAccepted: true,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  },
];
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

// Get application statistics (Admin only)
export const getApplicationStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      console.log('[CounselorApplication] Fetching application statistics');
      
      const pending = applications.filter(app => app.status === 'pending').length;
      const approved = applications.filter(app => app.status === 'approved').length;
      const rejected = applications.filter(app => app.status === 'rejected').length;
      const total = applications.length;
      
      return {
        pending,
        approved,
        rejected,
        total,
      };
    } catch (error) {
      console.error('[CounselorApplication] Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
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
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    search: z.string().max(100).optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input, ctx }) => {
    try {
      console.log('[CounselorApplication] Fetching all applications with filters:', input);
      
      let filteredApplications = [...applications];
      
      // Filter by status
      if (input.status) {
        filteredApplications = filteredApplications.filter(app => app.status === input.status);
      }
      
      // Filter by search query
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredApplications = filteredApplications.filter(app => 
          app.personalInfo.fullName.toLowerCase().includes(searchLower) ||
          app.personalInfo.email.toLowerCase().includes(searchLower)
        );
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

// Approve application (Admin only)
export const approveApplicationProcedure = protectedProcedure
  .input(z.object({
    applicationId: z.string().min(1).max(100),
    adminNotes: z.string().max(1000).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[CounselorApplication] Approving application:', input.applicationId);
      
      const applicationIndex = applications.findIndex(app => app.id === input.applicationId);
      
      if (applicationIndex === -1) {
        throw new Error('Application not found');
      }
      
      const application = applications[applicationIndex];
      
      // Update application status
      applications[applicationIndex] = {
        ...application,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: ctx.user?.id || 'admin',
        adminNotes: input.adminNotes,
      };
      
      // Send approval email notification to counselor
      const emailSent = await EmailService.sendApprovalEmail(
        application.personalInfo.email,
        application.personalInfo.fullName
      );
      
      if (!emailSent) {
        console.warn('[CounselorApplication] Failed to send approval email, but application was approved');
      }
      
      console.log('[CounselorApplication] Application approved:', application.personalInfo.email);
      console.log('[CounselorApplication] Counselor granted portal access');
      console.log('[CounselorApplication] Approval email sent:', emailSent ? 'Success' : 'Failed');
      
      return {
        success: true,
        message: 'Application approved successfully. The counselor has been granted access to their professional portal and notified via email.',
        counselorEmail: application.personalInfo.email,
      };
    } catch (error) {
      console.error('[CounselorApplication] Error approving application:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to approve application');
    }
  });

// Reject application (Admin only)
export const rejectApplicationProcedure = protectedProcedure
  .input(z.object({
    applicationId: z.string().min(1).max(100),
    rejectionReason: z.string().min(1).max(500),
    adminNotes: z.string().max(1000).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[CounselorApplication] Rejecting application:', input.applicationId);
      
      const applicationIndex = applications.findIndex(app => app.id === input.applicationId);
      
      if (applicationIndex === -1) {
        throw new Error('Application not found');
      }
      
      const application = applications[applicationIndex];
      
      // Update application status
      applications[applicationIndex] = {
        ...application,
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: ctx.user?.id || 'admin',
        adminNotes: input.adminNotes,
        rejectionReason: input.rejectionReason,
      };
      
      // Send rejection email notification to counselor with specific reason
      const emailSent = await EmailService.sendRejectionEmail(
        application.personalInfo.email,
        application.personalInfo.fullName,
        input.rejectionReason
      );
      
      if (!emailSent) {
        console.warn('[CounselorApplication] Failed to send rejection email, but application was rejected');
      }
      
      // Schedule document deletion after 30 days
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);
      
      applications[applicationIndex] = {
        ...applications[applicationIndex],
        documentDeletionScheduled: deletionDate.toISOString(),
      };
      
      console.log('[CounselorApplication] Application rejected:', application.personalInfo.email);
      console.log('[CounselorApplication] Rejection reason:', input.rejectionReason);
      console.log('[CounselorApplication] Documents scheduled for deletion:', deletionDate.toISOString());
      console.log('[CounselorApplication] Rejection email sent:', emailSent ? 'Success' : 'Failed');
      
      return {
        success: true,
        message: `Application rejected. The counselor has been notified with the rejection reason: "${input.rejectionReason}". Documents will be deleted after 30 days.`,
        counselorEmail: application.personalInfo.email,
        rejectionReason: input.rejectionReason,
      };
    } catch (error) {
      console.error('[CounselorApplication] Error rejecting application:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to reject application');
    }
  });