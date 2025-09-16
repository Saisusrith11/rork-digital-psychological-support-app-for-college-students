import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/backend/trpc/app-router';
import { createContext } from '@/backend/trpc/create-context';

// Handle all tRPC requests
const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
  });
};

export const GET = handler;
export const POST = handler;