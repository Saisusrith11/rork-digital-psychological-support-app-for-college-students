import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  try {
    // Prefer same-origin on web
    const maybeOrigin = (globalThis as any)?.location?.origin as string | undefined;
    if (maybeOrigin && typeof maybeOrigin === 'string') return maybeOrigin;
  } catch {}
  // Relative base (works with dev proxy and hosted)
  return "";
};

const base = getBaseUrl();
const apiUrl = base ? `${base}/api/trpc` : "/api/trpc";

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: apiUrl,
      transformer: superjson,
    }),
  ],
});