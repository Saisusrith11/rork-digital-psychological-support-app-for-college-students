import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/hooks/auth-store";
import { MoodProvider } from "@/hooks/mood-store";
import { AssessmentProvider } from "@/hooks/assessment-store";
import { LanguageProvider } from "@/hooks/language-store";
import { NotificationProvider } from "@/hooks/notification-store";
import { FeedbackProvider } from "@/hooks/feedback-store";
import { ThemeProvider } from "@/hooks/theme-store";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineProvider } from "@/hooks/offline-store";
import { WellnessProvider } from "@/hooks/wellness-store";
// import NotificationBell from "@/components/NotificationBell";
// import NotificationCenter from "@/components/NotificationCenter";

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
  // const { isRTL } = useLanguage();
  // const [centerOpen, setCenterOpen] = useState<boolean>(false);

  // const openCenter = useCallback(() => setCenterOpen(true), []);
  // const closeCenter = useCallback(() => setCenterOpen(false), []);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      try {
        const canGo = router.canGoBack?.() ?? false;
        console.log("[BackHandler] Back pressed. canGoBack=", canGo);
        if (!canGo) {
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
    <View style={styles.container}>
      <Stack
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
        <Stack.Screen name="enter-counselor" options={{ headerShown: false }} />
        <Stack.Screen name="test" options={{ headerShown: true, title: "Test Screen" }} />
      </Stack>
      {/* <NotificationBell onOpenCenter={openCenter} />
      <NotificationCenter visible={centerOpen} onClose={closeCenter} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  useEffect(() => {
    console.log('[RootLayout] Initializing app...');
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
              <ThemeProvider>
                <LanguageProvider>
                  <AuthProvider>
                    <NotificationProvider>
                      <FeedbackProvider>
                        <MoodProvider>
                          <AssessmentProvider>
                            <WellnessProvider>
                              <OfflineProvider>
                                <RootLayoutNav />
                              </OfflineProvider>
                            </WellnessProvider>
                          </AssessmentProvider>
                        </MoodProvider>
                      </FeedbackProvider>
                    </NotificationProvider>
                  </AuthProvider>
                </LanguageProvider>
              </ThemeProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </trpc.Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
