// This file is excluded from client bundle by webpack config
// It only runs on the server side

// Prevent any client-side execution with multiple checks
let app: any;

if (typeof window !== 'undefined' || typeof document !== 'undefined' || typeof navigator !== 'undefined') {
  // Client-side fallback
  app = {
    fetch: () => Promise.resolve(new Response('Not available on client', { status: 404 }))
  };
} else {
  // Server-side code
  try {
    // Use dynamic require to avoid static analysis
    const honoModule = eval('require')('../../backend/hono');
    app = honoModule.default || honoModule;
  } catch (error) {
    console.error('Failed to load Hono app:', error);
    app = {
      fetch: () => Promise.resolve(new Response('Server error', { status: 500 }))
    };
  }
}

export default app;
