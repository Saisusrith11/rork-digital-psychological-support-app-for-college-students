let app: any;
// Only load server code in a server (web) environment
if (typeof window === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app = require('@/backend/hono').default;
} else {
  app = {} as any;
}

export default app;
