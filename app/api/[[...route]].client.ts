// Client-side stub for server-only API route
// This file is used when the server-only file is excluded from client bundle

if (typeof window !== 'undefined') {
  // Client-side stub
  module.exports = {
    fetch: () => Promise.resolve(new Response('API not available on client', { status: 404 }))
  };
} else {
  // Server-side should never reach here, but provide a fallback
  module.exports = {};
}