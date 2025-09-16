// API route handler for web environment only
// This file should only be imported in server context

// Use conditional require to prevent bundling issues
let app: any = {};

if (typeof window === 'undefined') {
  try {
    // Only import server code on the server
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    app = require('@/backend/hono').default;
  } catch (error) {
    console.error('Failed to load server:', error);
  }
}

export default app;
