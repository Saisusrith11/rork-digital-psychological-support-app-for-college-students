import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { AuthProvider } from "@/hooks/auth-store";
import { MoodProvider } from "@/hooks/mood-store";
import { AssessmentProvider } from "@/hooks/assessment-store";
import { LanguageProvider } from "@/hooks/language-store";
import { NotificationProvider } from "@/hooks/notification-store";
import { FeedbackProvider } from "@/hooks/feedback-store";
import { ThemeProvider } from "@/hooks/theme-store";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function RootLayoutNav() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      try {
        const canGo = router.canGoBack?.() ?? false;
        console.log("[BackHandler] Back pressed. canGoBack=", canGo);
        if (!canGo) {
          // Prevent GO_BACK action warning at root
          return true;
        }
        router.back();
        return true;
      } catch (e) {
        console.log("[BackHandler] Error handling back press:", e);
        return true;
      }
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      sub.remove();
    };
  }, [router]);

  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        headerBackTitle: "Back",
        headerBackVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(counselor)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(volunteer)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="booking" options={{ headerShown: false }} />
      <Stack.Screen name="assessment" options={{ headerShown: true }} />
      <Stack.Screen name="assessment-result" options={{ headerShown: true }} />
      <Stack.Screen name="weekly-report" options={{ headerShown: true }} />
      <Stack.Screen name="resource-detail" options={{ headerShown: true }} />
      <Stack.Screen name="counselor-application" options={{ headerShown: false }} />
      <Stack.Screen name="counselor-applications-admin" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <GestureHandlerRootView style={styles.container}>
            <ThemeProvider>
              <LanguageProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <FeedbackProvider>
                      <MoodProvider>
                        <AssessmentProvider>
                          <RootLayoutNav />
                        </AssessmentProvider>
                      </MoodProvider>
                    </FeedbackProvider>
                  </NotificationProvider>
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </GestureHandlerRootView>
        </trpc.Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}