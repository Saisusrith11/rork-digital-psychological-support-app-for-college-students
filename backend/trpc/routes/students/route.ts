import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '@/backend/trpc/create-context';

export interface College {
  id: string;
  name: string;
  location?: string;
  studentCount: number;
  isVerified: boolean;
  addedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  college: string;
  collegeId?: string;
  year: string;
  course: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  lastAssessmentDate?: string;
  assessmentCount: number;
  joinedAt: string;
  lastActive: string;
  isActive: boolean;
}

// Mock data
const colleges: College[] = [
  {
    id: 'col_1',
    name: 'Delhi University',
    location: 'New Delhi',
    studentCount: 145,
    isVerified: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'col_2',
    name: 'IIT Delhi',
    location: 'New Delhi',
    studentCount: 89,
    isVerified: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'col_3',
    name: 'Jawaharlal Nehru University',
    location: 'New Delhi',
    studentCount: 67,
    isVerified: true,
    addedAt: new Date().toISOString(),
  },
];

const students: StudentProfile[] = [
  {
    id: 'stu_1',
    userId: 'user_1',
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    college: 'Delhi University',
    collegeId: 'col_1',
    year: '3rd Year',
    course: 'Computer Science',
    riskLevel: 'low',
    riskScore: 25,
    lastAssessmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    assessmentCount: 3,
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'stu_2',
    userId: 'user_2',
    fullName: 'Jane Smith',
    email: 'jane.smith@email.com',
    college: 'IIT Delhi',
    collegeId: 'col_2',
    year: '2nd Year',
    course: 'Electrical Engineering',
    riskLevel: 'high',
    riskScore: 78,
    lastAssessmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assessmentCount: 5,
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'stu_3',
    userId: 'user_3',
    fullName: 'Alex Johnson',
    email: 'alex.j@email.com',
    college: 'Delhi University',
    collegeId: 'col_1',
    year: '1st Year',
    course: 'Psychology',
    riskLevel: 'medium',
    riskScore: 52,
    lastAssessmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    assessmentCount: 2,
    joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
];

// Calculate risk level from score
function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 33) return 'low';
  if (score <= 66) return 'medium';
  return 'high';
}

// Get all colleges (Admin only)
export const getAllCollegesProcedure = protectedProcedure
  .input(z.object({
    search: z.string().optional(),
    onlyVerified: z.boolean().default(false),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input, ctx }) => {
    try {
      console.log('[Students] Fetching colleges:', input);
      
      let filteredColleges = [...colleges];
      
      // Filter by verification status
      if (input.onlyVerified) {
        filteredColleges = filteredColleges.filter(c => c.isVerified);
      }
      
      // Filter by search
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredColleges = filteredColleges.filter(c =>
          c.name.toLowerCase().includes(searchLower) ||
          (c.location && c.location.toLowerCase().includes(searchLower))
        );
      }
      
      // Sort by student count (descending)
      filteredColleges.sort((a, b) => b.studentCount - a.studentCount);
      
      // Paginate
      const paginatedColleges = filteredColleges.slice(
        input.offset,
        input.offset + input.limit
      );
      
      return {
        colleges: paginatedColleges,
        total: filteredColleges.length,
        hasMore: input.offset + input.limit < filteredColleges.length,
      };
    } catch (error) {
      console.error('[Students] Error fetching colleges:', error);
      throw new Error('Failed to fetch colleges');
    }
  });

// Add new college (Admin only)
export const addCollegeProcedure = protectedProcedure
  .input(z.object({
    name: z.string().min(1).max(200),
    location: z.string().optional(),
    isVerified: z.boolean().default(false),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Students] Adding college:', input.name);
      
      // Check if college already exists
      const existing = colleges.find(c => 
        c.name.toLowerCase() === input.name.toLowerCase()
      );
      
      if (existing) {
        throw new Error('College already exists');
      }
      
      const college: College = {
        id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: input.name,
        location: input.location,
        studentCount: 0,
        isVerified: input.isVerified,
        addedAt: new Date().toISOString(),
      };
      
      colleges.push(college);
      
      console.log('[Students] College added:', college.id);
      
      return {
        success: true,
        college,
        message: 'College added successfully',
      };
    } catch (error) {
      console.error('[Students] Error adding college:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add college');
    }
  });

// Verify college (Admin only)
export const verifyCollegeProcedure = protectedProcedure
  .input(z.object({
    collegeId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Students] Verifying college:', input.collegeId);
      
      const collegeIndex = colleges.findIndex(c => c.id === input.collegeId);
      
      if (collegeIndex === -1) {
        throw new Error('College not found');
      }
      
      colleges[collegeIndex].isVerified = true;
      
      console.log('[Students] College verified:', input.collegeId);
      
      return {
        success: true,
        message: 'College verified successfully',
      };
    } catch (error) {
      console.error('[Students] Error verifying college:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to verify college');
    }
  });

// Get students by college and risk level (Admin only)
export const getStudentsByCollegeProcedure = protectedProcedure
  .input(z.object({
    collegeId: z.string().optional(),
    collegeName: z.string().optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'all']).default('all'),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'riskScore', 'lastActive', 'joinedAt']).default('riskScore'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input, ctx }) => {
    try {
      console.log('[Students] Fetching students:', input);
      
      let filteredStudents = students.filter(s => s.isActive);
      
      // Filter by college
      if (input.collegeId) {
        filteredStudents = filteredStudents.filter(s => s.collegeId === input.collegeId);
      } else if (input.collegeName) {
        const collegeNameLower = input.collegeName.toLowerCase();
        filteredStudents = filteredStudents.filter(s => 
          s.college.toLowerCase().includes(collegeNameLower)
        );
      }
      
      // Filter by risk level
      if (input.riskLevel !== 'all') {
        filteredStudents = filteredStudents.filter(s => s.riskLevel === input.riskLevel);
      }
      
      // Filter by search
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredStudents = filteredStudents.filter(s =>
          s.fullName.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower) ||
          s.course.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort
      filteredStudents.sort((a, b) => {
        let comparison = 0;
        switch (input.sortBy) {
          case 'name':
            comparison = a.fullName.localeCompare(b.fullName);
            break;
          case 'riskScore':
            comparison = a.riskScore - b.riskScore;
            break;
          case 'lastActive':
            comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
            break;
          case 'joinedAt':
            comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
            break;
        }
        return input.sortOrder === 'asc' ? comparison : -comparison;
      });
      
      // Calculate statistics
      const stats = {
        total: filteredStudents.length,
        byRiskLevel: {
          low: filteredStudents.filter(s => s.riskLevel === 'low').length,
          medium: filteredStudents.filter(s => s.riskLevel === 'medium').length,
          high: filteredStudents.filter(s => s.riskLevel === 'high').length,
        },
        averageRiskScore: filteredStudents.length > 0
          ? Math.round(filteredStudents.reduce((sum, s) => sum + s.riskScore, 0) / filteredStudents.length)
          : 0,
      };
      
      // Paginate
      const paginatedStudents = filteredStudents.slice(
        input.offset,
        input.offset + input.limit
      );
      
      return {
        students: paginatedStudents,
        stats,
        total: filteredStudents.length,
        hasMore: input.offset + input.limit < filteredStudents.length,
      };
    } catch (error) {
      console.error('[Students] Error fetching students:', error);
      throw new Error('Failed to fetch students');
    }
  });

// Update student risk level (System/Admin only)
export const updateStudentRiskLevelProcedure = protectedProcedure
  .input(z.object({
    studentId: z.string(),
    riskScore: z.number().min(0).max(100),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Students] Updating student risk level:', input.studentId);
      
      const studentIndex = students.findIndex(s => s.id === input.studentId);
      
      if (studentIndex === -1) {
        throw new Error('Student not found');
      }
      
      const riskLevel = calculateRiskLevel(input.riskScore);
      
      students[studentIndex] = {
        ...students[studentIndex],
        riskScore: input.riskScore,
        riskLevel,
        lastAssessmentDate: new Date().toISOString(),
        assessmentCount: students[studentIndex].assessmentCount + 1,
      };
      
      console.log('[Students] Student risk level updated:', input.studentId, riskLevel);
      
      return {
        success: true,
        student: students[studentIndex],
        message: 'Risk level updated successfully',
      };
    } catch (error) {
      console.error('[Students] Error updating risk level:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update risk level');
    }
  });

// Get college suggestions for autocomplete (Public)
export const getCollegeSuggestionsProcedure = publicProcedure
  .input(z.object({
    query: z.string().min(1).max(100),
  }))
  .query(async ({ input }) => {
    try {
      console.log('[Students] Getting college suggestions:', input.query);
      
      const queryLower = input.query.toLowerCase();
      const suggestions = colleges
        .filter(c => c.isVerified && c.name.toLowerCase().includes(queryLower))
        .map(c => ({
          id: c.id,
          name: c.name,
          location: c.location,
        }))
        .slice(0, 10);
      
      return {
        suggestions,
      };
    } catch (error) {
      console.error('[Students] Error getting suggestions:', error);
      throw new Error('Failed to get suggestions');
    }
  });

// Submit new college for review (Public)
export const submitCollegeForReviewProcedure = publicProcedure
  .input(z.object({
    name: z.string().min(1).max(200),
    location: z.string().optional(),
    submittedBy: z.string().email(),
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('[Students] Submitting college for review:', input.name);
      
      // Check if college already exists
      const existing = colleges.find(c => 
        c.name.toLowerCase() === input.name.toLowerCase()
      );
      
      if (existing) {
        return {
          success: true,
          message: 'College already exists in our system',
          collegeId: existing.id,
        };
      }
      
      const college: College = {
        id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: input.name,
        location: input.location,
        studentCount: 1,
        isVerified: false, // Needs admin review
        addedAt: new Date().toISOString(),
      };
      
      colleges.push(college);
      
      console.log('[Students] College submitted for review:', college.id);
      
      return {
        success: true,
        message: 'College submitted for review. It will be available once approved.',
        collegeId: college.id,
      };
    } catch (error) {
      console.error('[Students] Error submitting college:', error);
      throw new Error('Failed to submit college');
    }
  });

// Get student statistics by college (Admin only)
export const getCollegeStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      console.log('[Students] Fetching college statistics');
      
      const collegeStats = colleges.map(college => {
        const collegeStudents = students.filter(s => s.collegeId === college.id && s.isActive);
        
        return {
          collegeId: college.id,
          collegeName: college.name,
          location: college.location,
          studentCount: collegeStudents.length,
          riskDistribution: {
            low: collegeStudents.filter(s => s.riskLevel === 'low').length,
            medium: collegeStudents.filter(s => s.riskLevel === 'medium').length,
            high: collegeStudents.filter(s => s.riskLevel === 'high').length,
          },
          averageRiskScore: collegeStudents.length > 0
            ? Math.round(collegeStudents.reduce((sum, s) => sum + s.riskScore, 0) / collegeStudents.length)
            : 0,
          isVerified: college.isVerified,
        };
      }).sort((a, b) => b.studentCount - a.studentCount);
      
      const overallStats = {
        totalColleges: colleges.length,
        verifiedColleges: colleges.filter(c => c.isVerified).length,
        totalStudents: students.filter(s => s.isActive).length,
        overallRiskDistribution: {
          low: students.filter(s => s.riskLevel === 'low' && s.isActive).length,
          medium: students.filter(s => s.riskLevel === 'medium' && s.isActive).length,
          high: students.filter(s => s.riskLevel === 'high' && s.isActive).length,
        },
      };
      
      return {
        collegeStats,
        overallStats,
      };
    } catch (error) {
      console.error('[Students] Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  });