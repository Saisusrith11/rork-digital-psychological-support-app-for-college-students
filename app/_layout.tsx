import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { AuthProvider } from '@/hooks/auth-store';
import { ThemeProvider } from '@/hooks/theme-store';
import { NotificationProvider } from '@/hooks/notification-store';
import { ErrorBoundary } from '@/components/ErrorBoundary';


// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('Failed to prevent splash screen auto-hide');
});

// Main navigation stack
function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(counselor)" />
      <Stack.Screen name="(volunteer)" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="assessment-result" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="booking" />

      <Stack.Screen name="resource-detail" />
      <Stack.Screen name="weekly-report" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount < 2) return true;
        return false;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});



export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[RootLayout] Initializing app...');
        
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[RootLayout] App initialized successfully');
      } catch (error) {
        console.error('[RootLayout] Error during initialization:', error);
      } finally {
        // Set ready state first
        setIsReady(true);
        
        // Hide splash screen after a small delay to ensure state is updated
        const timeoutId = setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
          } catch (error) {
            console.log('Splash screen already hidden or error hiding:', error);
          }
        }, 100);
        
        // Cleanup timeout if component unmounts
        return () => clearTimeout(timeoutId);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null; // Keep splash screen visible
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationProvider>
              <ThemeProvider>
                <View style={styles.container}>
                  <RootLayoutNav />
                </View>
              </ThemeProvider>
            </NotificationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});