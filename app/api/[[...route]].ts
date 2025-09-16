// This file is excluded from client bundle by webpack config
// It only runs on the server side

let app: any;

if (typeof window !== 'undefined') {
  // Client-side fallback (should never be reached due to webpack config)
  app = {
    fetch: () => new Response('API not available on client', { status: 404 })
  };
} else {
  // Server-side: import the actual Hono app
  // This import is safe because this file is excluded from client bundle
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: honoApp } = require('../../backend/hono');
    app = honoApp;
  } catch (error) {
    console.error('Failed to load Hono app:', error);
    app = {
      fetch: () => new Response('Server error', { status: 500 })
    };
  }
}

export default app;
