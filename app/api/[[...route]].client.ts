// Client-side stub for server-only API route
// This file is used when the server-only file is excluded from client bundle

const clientStub = {
  fetch: () => Promise.resolve(new Response('API not available on client', { status: 404 }))
};

export default clientStub;