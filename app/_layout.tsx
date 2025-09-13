import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { AuthProvider } from "@/hooks/auth-store";
import { MoodProvider } from "@/hooks/mood-store";
import { AssessmentProvider } from "@/hooks/assessment-store";
import { LanguageProvider } from "@/hooks/language-store";
import { NotificationProvider } from "@/hooks/notification-store";
import { FeedbackProvider } from "@/hooks/feedback-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(counselor)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="booking" options={{ headerShown: false }} />
      <Stack.Screen name="assessment" options={{ headerShown: true }} />
      <Stack.Screen name="assessment-result" options={{ headerShown: true }} />
      <Stack.Screen name="weekly-report" options={{ headerShown: true }} />
      <Stack.Screen name="resource-detail" options={{ headerShown: true }} />
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
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
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}