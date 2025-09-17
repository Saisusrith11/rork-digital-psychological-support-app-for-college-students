import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { trpc, trpcClient } from '@/lib/trpc';
import * as SplashScreen from 'expo-splash-screen';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from '@/hooks/auth-store';
// import { ErrorBoundary } from '@/components/ErrorBoundary';

// Simple error boundary wrapper
class RorkErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>Please restart the app</Text>
          </View>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
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

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Handle error silently
});

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false,
//       staleTime: 1000 * 60 * 5, // 5 minutes
//     },
//     mutations: {
//       retry: 1,
//     },
//   },
// });

export default function RootLayout() {
  useEffect(() => {
    console.log('[RootLayout] App initialized');
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {
        // Handle error silently
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <RorkErrorBoundary>
      <SafeAreaProvider>
        <View style={styles.container}>
          <RootLayoutNav />
        </View>
      </SafeAreaProvider>
    </RorkErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});