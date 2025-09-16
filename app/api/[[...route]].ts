// This file is excluded from client bundle by webpack config
// It only runs on the server side

// Prevent any client-side execution
if (typeof window !== 'undefined') {
  throw new Error('Server-only file accessed on client');
}

// Dynamic import to prevent bundling issues
let app: any;

try {
  // Use dynamic require to avoid static analysis
  const honoModule = eval('require')('../../backend/hono');
  app = honoModule.default || honoModule;
} catch (error) {
  console.error('Failed to load Hono app:', error);
  app = {
    fetch: () => new Response('Server error', { status: 500 })
  };
}

export default app;
