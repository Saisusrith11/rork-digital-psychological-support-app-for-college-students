// Client-safe type definitions for tRPC
// This file uses type-only imports to avoid bundling server code

import type { AppRouter as ServerAppRouter } from '@/backend/trpc/app-router';

export type AppRouter = ServerAppRouter;

// You can add more client-safe types here as needed