import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context';

export type Helpline = {
  id: string;
  name: string;
  phone: string;
  region?: string;
  updatedAt: string;
  deleted?: boolean;
};

const memoryStore: { helplines: Helpline[] } = {
  helplines: [
    { id: 'nimhans', name: 'NIMHANS', phone: '18005990019', region: 'India', updatedAt: new Date(0).toISOString() },
    { id: 'icall', name: 'iCall', phone: '+919152987821', region: 'India', updatedAt: new Date(0).toISOString() },
  ],
};

export const getAllHelplinesProcedure = publicProcedure.query(() => {
  return memoryStore.helplines;
});

export const upsertManyHelplinesProcedure = publicProcedure
  .input(z.object({ helplines: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    region: z.string().optional(),
    updatedAt: z.string(),
    deleted: z.boolean().optional(),
  })) }))
  .mutation(({ input }) => {
    const map: Record<string, Helpline> = {};
    memoryStore.helplines.forEach(h => { map[h.id] = h; });
    input.helplines.forEach(h => {
      const existing = map[h.id];
      if (!existing || new Date(h.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
        if (h.deleted) {
          delete map[h.id];
        } else {
          map[h.id] = h;
        }
      }
    });
    memoryStore.helplines = Object.values(map);
    return { success: true } as const;
  });

const helplinesRouter = createTRPCRouter({
  getAll: getAllHelplinesProcedure,
  upsertMany: upsertManyHelplinesProcedure,
});

export default helplinesRouter;
