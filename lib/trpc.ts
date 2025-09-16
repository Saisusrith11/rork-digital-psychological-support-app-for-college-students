import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const ensureHttpScheme = (url: string) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://${url}`;
};

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  if (Platform.OS === "web") {
    try {
      const origin = (globalThis as any)?.location?.origin as string | undefined;
      if (origin) return origin;
    } catch {}
    return "";
  }
  const hostUri = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoClient?.hostUri || (Constants as any)?.manifest?.hostUri;
  if (typeof hostUri === "string" && hostUri.length > 0) {
    const base = ensureHttpScheme(hostUri.split("/")[0]);
    return base;
  }
  return "";
};

const base = getBaseUrl();
const apiUrl = base ? `${base}/api/trpc` : "/api/trpc";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
      transformer: superjson,
    }),
  ],
});
