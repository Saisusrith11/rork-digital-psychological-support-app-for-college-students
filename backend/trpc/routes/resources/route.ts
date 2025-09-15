import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '@/backend/trpc/create-context';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'pdf' | 'meditation';
  category: string;
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  fileSize?: number;
  mimeType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  viewCount: number;
  isActive: boolean;
}

// Mock storage for resources
const resources: Resource[] = [
  {
    id: 'res_1',
    title: 'Breathing Exercise for Anxiety',
    description: 'A guided breathing exercise to help manage anxiety and stress',
    type: 'audio',
    category: 'Anxiety Management',
    fileUrl: 'https://example.com/breathing-exercise.mp3',
    duration: '10:30',
    fileSize: 5242880,
    mimeType: 'audio/mpeg',
    tags: ['anxiety', 'breathing', 'relaxation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    viewCount: 245,
    isActive: true,
  },
  {
    id: 'res_2',
    title: 'Understanding Depression',
    description: 'An informative guide about depression, its symptoms, and coping strategies',
    type: 'pdf',
    category: 'Educational',
    fileUrl: 'https://example.com/depression-guide.pdf',
    fileSize: 2097152,
    mimeType: 'application/pdf',
    tags: ['depression', 'mental health', 'education'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    viewCount: 189,
    isActive: true,
  },
  {
    id: 'res_3',
    title: 'Mindfulness Meditation',
    description: 'A 15-minute guided mindfulness meditation session',
    type: 'meditation',
    category: 'Meditation',
    fileUrl: 'https://example.com/mindfulness.mp3',
    duration: '15:00',
    fileSize: 7340032,
    mimeType: 'audio/mpeg',
    tags: ['mindfulness', 'meditation', 'stress relief'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    viewCount: 412,
    isActive: true,
  },
  {
    id: 'res_4',
    title: 'Coping with Exam Stress',
    description: 'Video guide on managing exam-related stress and anxiety',
    type: 'video',
    category: 'Academic Support',
    fileUrl: 'https://example.com/exam-stress.mp4',
    thumbnailUrl: 'https://example.com/exam-stress-thumb.jpg',
    duration: '8:45',
    fileSize: 52428800,
    mimeType: 'video/mp4',
    tags: ['exam stress', 'academic', 'students'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    viewCount: 567,
    isActive: true,
  },
];

const ResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  type: z.enum(['video', 'audio', 'pdf', 'meditation']),
  category: z.string().min(1).max(100),
  fileUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string(),
  tags: z.array(z.string()).default([]),
});

// Get all resources (public)
export const getAllResourcesProcedure = publicProcedure
  .input(z.object({
    type: z.enum(['video', 'audio', 'pdf', 'meditation', 'all']).default('all'),
    category: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input }) => {
    try {
      console.log('[Resources] Fetching resources:', input);
      
      let filteredResources = resources.filter(r => r.isActive);
      
      // Filter by type
      if (input.type !== 'all') {
        filteredResources = filteredResources.filter(r => r.type === input.type);
      }
      
      // Filter by category
      if (input.category) {
        const categoryLower = input.category.toLowerCase();
        filteredResources = filteredResources.filter(r => 
          r.category.toLowerCase().includes(categoryLower)
        );
      }
      
      // Filter by search query
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredResources = filteredResources.filter(r => 
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Sort by view count (most popular first)
      filteredResources.sort((a, b) => b.viewCount - a.viewCount);
      
      // Paginate
      const paginatedResources = filteredResources.slice(
        input.offset,
        input.offset + input.limit
      );
      
      return {
        resources: paginatedResources,
        total: filteredResources.length,
        hasMore: input.offset + input.limit < filteredResources.length,
      };
    } catch (error) {
      console.error('[Resources] Error fetching resources:', error);
      throw new Error('Failed to fetch resources');
    }
  });

// Get resource by ID (public)
export const getResourceByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    try {
      console.log('[Resources] Fetching resource:', input.id);
      
      const resource = resources.find(r => r.id === input.id && r.isActive);
      
      if (!resource) {
        throw new Error('Resource not found');
      }
      
      // Increment view count
      resource.viewCount++;
      
      return resource;
    } catch (error) {
      console.error('[Resources] Error fetching resource:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch resource');
    }
  });

// Create resource (Admin only)
export const createResourceProcedure = protectedProcedure
  .input(ResourceSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Resources] Creating resource:', input.title);
      
      // In production, verify admin role from ctx.user
      
      const resource: Resource = {
        id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ctx.user?.id || 'admin',
        viewCount: 0,
        isActive: true,
      };
      
      resources.push(resource);
      
      console.log('[Resources] Resource created:', resource.id);
      
      return {
        success: true,
        resource,
        message: 'Resource created successfully',
      };
    } catch (error) {
      console.error('[Resources] Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
  });

// Update resource (Admin only)
export const updateResourceProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    data: ResourceSchema.partial(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Resources] Updating resource:', input.id);
      
      const resourceIndex = resources.findIndex(r => r.id === input.id);
      
      if (resourceIndex === -1) {
        throw new Error('Resource not found');
      }
      
      resources[resourceIndex] = {
        ...resources[resourceIndex],
        ...input.data,
        updatedAt: new Date().toISOString(),
      };
      
      console.log('[Resources] Resource updated:', input.id);
      
      return {
        success: true,
        resource: resources[resourceIndex],
        message: 'Resource updated successfully',
      };
    } catch (error) {
      console.error('[Resources] Error updating resource:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update resource');
    }
  });

// Delete resource (Admin only)
export const deleteResourceProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      console.log('[Resources] Deleting resource:', input.id);

      const resourceIndex = resources.findIndex(r => r.id === input.id);

      if (resourceIndex === -1) {
        throw new Error('Resource not found');
      }

      const fileUrl = resources[resourceIndex].fileUrl;

      // Hard delete from in-memory store
      resources.splice(resourceIndex, 1);

      // Simulate purge from cloud storage
      console.log('[Resources] Purging file from storage:', fileUrl);

      return {
        success: true,
        message: 'Resource and file purged successfully',
      };
    } catch (error) {
      console.error('[Resources] Error deleting resource:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete resource');
    }
  });

// Upload resource file (Admin only)
export const uploadResourceFileProcedure = protectedProcedure
  .input(z.object({
    fileName: z.string(),
    fileData: z.string(), // Base64 encoded
    mimeType: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('[Resources] Uploading file:', input.fileName);

      // TODO: In production, upload to secure cloud storage (AWS S3, etc.) using presigned URLs
      // For now, simulate file upload
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileUrl = `https://secure-storage.example.com/resources/${Date.now()}_${safeName}`;
      const fileSize = Math.floor(input.fileData.length * 0.75);

      console.log('[Resources] File uploaded:', { fileUrl, fileSize, mimeType: input.mimeType });

      return {
        success: true,
        fileUrl,
        fileSize,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('[Resources] Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  });

// Get resource categories (public)
export const getResourceCategoriesProcedure = publicProcedure
  .query(async () => {
    try {
      console.log('[Resources] Fetching categories');
      
      const categories = [...new Set(resources.filter(r => r.isActive).map(r => r.category))];
      
      return {
        categories,
      };
    } catch (error) {
      console.error('[Resources] Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  });

// Get resource statistics (Admin only)
export const getResourceStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      console.log('[Resources] Fetching resource statistics');
      
      const activeResources = resources.filter(r => r.isActive);
      
      const stats = {
        total: activeResources.length,
        byType: {
          video: activeResources.filter(r => r.type === 'video').length,
          audio: activeResources.filter(r => r.type === 'audio').length,
          pdf: activeResources.filter(r => r.type === 'pdf').length,
          meditation: activeResources.filter(r => r.type === 'meditation').length,
        },
        totalViews: activeResources.reduce((sum, r) => sum + r.viewCount, 0),
        mostViewed: activeResources.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
        recentlyAdded: activeResources.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5),
      };
      
      return stats;
    } catch (error) {
      console.error('[Resources] Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  });