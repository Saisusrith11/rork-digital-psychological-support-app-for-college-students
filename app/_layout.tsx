import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { AuthProvider } from '@/hooks/auth-store';
import { ThemeProvider } from '@/hooks/theme-store';

// Simple type for now to avoid backend imports
type AppRouter = any;

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('Failed to prevent splash screen auto-hide');
});

// Error boundary component
class RorkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              The app encountered an unexpected error. Please restart the app.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.message}
              </Text>
            )}
          </View>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}

// Main navigation stack
function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
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

// Get API URL based on platform
function getApiUrl() {
  if (Platform.OS === 'web') {
    return '/api/trpc';
  }
  
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/api/trpc`;
  }
  
  // Fallback for development
  return 'http://localhost:3000/api/trpc';
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  // Create tRPC client
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: getApiUrl(),
          transformer: superjson,
          headers: () => {
            return {
              'Content-Type': 'application/json',
            };
          },
        }),
      ],
    })
  );

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[RootLayout] Initializing app...');
        
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('[RootLayout] App initialized successfully');
      } catch (error) {
        console.error('[RootLayout] Error during initialization:', error);
      } finally {
        setIsReady(true);
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null; // Keep splash screen visible
  }

  return (
    <RorkErrorBoundary>
      <SafeAreaProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeProvider>
                <View style={styles.container}>
                  <RootLayoutNav />
                </View>
              </ThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </SafeAreaProvider>
    </RorkErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: Colors.error,
    textAlign: 'center' as const,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: Colors.surfaceLight,
    padding: 10,
    borderRadius: 8,
  },
});