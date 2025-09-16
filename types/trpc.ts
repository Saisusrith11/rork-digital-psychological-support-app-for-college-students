// Re-export the actual AppRouter type from backend
// This ensures type consistency between client and server
export type { AppRouter } from '@/backend/trpc/app-router';

// You can add more client-safe types here as needed