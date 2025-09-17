import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/hooks/auth-store';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(counselor)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(volunteer)" options={{ headerShown: false }} />
      <Stack.Screen name="booking" options={{ headerShown: true, title: 'Book Appointment' }} />
      <Stack.Screen name="assessment" options={{ headerShown: true, title: 'Assessment' }} />
      <Stack.Screen name="assessment-result" options={{ headerShown: true, title: 'Assessment Result' }} />
      <Stack.Screen name="weekly-report" options={{ headerShown: true, title: 'Weekly Report' }} />
      <Stack.Screen name="resource-detail" options={{ headerShown: true, title: 'Resource Details' }} />
      <Stack.Screen name="counselor-application" options={{ headerShown: false }} />
      <Stack.Screen name="counselor-applications-admin" options={{ headerShown: false }} />
      <Stack.Screen name="enter-counselor" options={{ headerShown: false }} />
      <Stack.Screen name="ai-chat" options={{ headerShown: true, title: 'AI Mental Health Support' }} />
      <Stack.Screen name="test" options={{ headerShown: true, title: 'Test Screen' }} />
    </Stack>
  );
}

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

export default function RootLayout() {
  useEffect(() => {
    console.log('[App] Initializing app...');
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
              <AuthProvider>
                <RootLayoutNav />
              </AuthProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </trpc.Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});