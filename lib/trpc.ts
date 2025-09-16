import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Define a minimal type interface to avoid importing server code
// This prevents any server-side imports during client bundling
type AppRouter = any;

// Use the minimal type to avoid importing server code during bundling
export const trpc = createTRPCReact<AppRouter>();

const normalizeToHttpOrigin = (uri: string): string => {
  if (!uri) return "";
  let candidate = uri.trim();
  if (candidate.startsWith("exp://")) candidate = candidate.replace("exp://", "http://");
  if (candidate.startsWith("https://") || candidate.startsWith("http://")) {
    try {
      const u = new URL(candidate);
      return u.origin;
    } catch {
      return "";
    }
  }
  if (candidate.includes("/")) {
    candidate = candidate.split("/")[0];
  }
  return `http://${candidate}`;
};

const getBaseUrl = () => {
  // For production, use the environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  
  // For web development
  if (Platform.OS === "web") {
    try {
      const origin = (globalThis as any)?.location?.origin as string | undefined;
      if (origin) return origin;
    } catch {}
    return "http://localhost:3000";
  }
  
  // For mobile development
  const hostUri =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.manifest?.hostUri ||
    (Constants as any)?.linkingUri;
  
  if (typeof hostUri === "string" && hostUri.length > 0) {
    const base = normalizeToHttpOrigin(hostUri);
    return base;
  }
  
  // Fallback for development
  return "http://localhost:3000";
};

const base = getBaseUrl();
const apiUrl = base ? `${base}/api/trpc` : "/api/trpc";
console.log("[tRPC] base:", base, "apiUrl:", apiUrl);

const resolvedApiUrl = (() => {
  const candidate = apiUrl;
  if (!candidate || typeof candidate !== "string" || candidate.length === 0) {
    return "/api/trpc";
  }
  return candidate;
})();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: resolvedApiUrl,
      transformer: superjson,
    }),
  ],
});
