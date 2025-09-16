import { z } from 'zod';
import { protectedProcedure, publicProcedure, createTRPCRouter } from '@/backend/trpc/create-context';

export type ActivityRiskLevel = 'minimal' | 'mild' | 'moderate' | 'severe';
export type ActivityCategory = 'mood' | 'mindfulness' | 'social' | 'education' | 'crisis' | 'goal';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  points: number;
  riskLevel: ActivityRiskLevel;
  category: ActivityCategory;
  duration?: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

const activities: ActivityItem[] = [];

const ActivitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  points: z.number().min(0).max(1000),
  riskLevel: z.enum(['minimal', 'mild', 'moderate', 'severe']),
  category: z.enum(['mood', 'mindfulness', 'social', 'education', 'crisis', 'goal']),
  duration: z.number().min(1).max(240).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video']).optional(),
});

export const getAllActivitiesProcedure = publicProcedure
  .input(z.object({
    riskLevel: z.enum(['minimal', 'mild', 'moderate', 'severe', 'all']).default('all'),
    category: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input }) => {
    try {
      console.log('[Activities] Fetching activities:', input);
      let items = activities.filter(a => a.isActive);
      if (input.riskLevel !== 'all') items = items.filter(a => a.riskLevel === input.riskLevel);
      if (input.category) {
        const c = input.category.toLowerCase();
        items = items.filter(a => a.category.toLowerCase().includes(c));
      }
      if (input.search) {
        const s = input.search.toLowerCase();
        items = items.filter(a => a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s));
      }
      const paginated = items.slice(input.offset, input.offset + input.limit);
      return { activities: paginated, total: items.length, hasMore: input.offset + input.limit < items.length };
    } catch (e) {
      console.error('[Activities] Error fetching activities:', e);
      throw new Error('Failed to fetch activities');
    }
  });

export const createActivityProcedure = protectedProcedure
  .input(ActivitySchema)
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Activities] Creating activity:', input.title);
      const activity: ActivityItem = {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ctx.user?.id ?? 'admin',
        isActive: true,
      };
      activities.unshift(activity);
      return { success: true, activity, message: 'Activity created successfully' };
    } catch (e) {
      console.error('[Activities] Error creating activity:', e);
      throw new Error('Failed to create activity');
    }
  });

export const updateActivityProcedure = protectedProcedure
  .input(z.object({ id: z.string(), data: ActivitySchema.partial() }))
  .mutation(async ({ input }) => {
    try {
      const idx = activities.findIndex(a => a.id === input.id);
      if (idx === -1) throw new Error('Activity not found');
      activities[idx] = { ...activities[idx], ...input.data, updatedAt: new Date().toISOString() };
      return { success: true, activity: activities[idx], message: 'Activity updated successfully' };
    } catch (e) {
      console.error('[Activities] Error updating activity:', e);
      throw new Error('Failed to update activity');
    }
  });

export const deleteActivityProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      const idx = activities.findIndex(a => a.id === input.id);
      if (idx === -1) throw new Error('Activity not found');
      activities.splice(idx, 1);
      return { success: true, message: 'Activity deleted successfully' };
    } catch (e) {
      console.error('[Activities] Error deleting activity:', e);
      throw new Error('Failed to delete activity');
    }
  });

const activitiesRouter = createTRPCRouter({
  getAll: getAllActivitiesProcedure,
  create: createActivityProcedure,
  update: updateActivityProcedure,
  delete: deleteActivityProcedure,
});

export default activitiesRouter;
