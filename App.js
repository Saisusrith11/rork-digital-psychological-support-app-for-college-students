import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './lib/trpc';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './hooks/auth-store';
import { MoodProvider } from './hooks/mood-store';
import { AssessmentProvider } from './hooks/assessment-store';
import { LanguageProvider } from './hooks/language-store';
import { NotificationProvider } from './hooks/notification-store';
import { FeedbackProvider } from './hooks/feedback-store';
import { ThemeProvider } from './hooks/theme-store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineProvider } from './hooks/offline-store';
import { WellnessProvider } from './hooks/wellness-store';

// Import screens
import MainNavigator from './navigation/MainNavigator';

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

const Stack = createNativeStackNavigator();

export default function App() {
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
              <ThemeProvider>
                <LanguageProvider>
                  <AuthProvider>
                    <NotificationProvider>
                      <FeedbackProvider>
                        <MoodProvider>
                          <AssessmentProvider>
                            <WellnessProvider>
                              <OfflineProvider>
                                <NavigationContainer>
                                  <MainNavigator />
                                </NavigationContainer>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});