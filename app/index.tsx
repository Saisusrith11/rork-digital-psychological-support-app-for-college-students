import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';

export default function IndexScreen() {
  const router = useRouter();
  const authContext = useAuth();
  
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const isLoading = authContext?.isLoading ?? true;

  useEffect(() => {
    if (!authContext) {
      console.log('[IndexScreen] Auth context not ready');
      return;
    }
    
    if (isLoading) {
      console.log('[IndexScreen] Loading auth state...');
      return;
    }

    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        console.log('[IndexScreen] User authenticated, role:', user.role);
        switch (user.role) {
          case 'counselor':
            router.replace('/(counselor)/dashboard');
            break;
          case 'admin':
            router.replace('/(admin)/dashboard');
            break;
          case 'volunteer':
            router.replace('/(volunteer)/dashboard');
            break;
          default:
            router.replace('/(tabs)/home');
        }
      } else {
        console.log('[IndexScreen] Redirecting to auth');
        router.replace('/auth');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router, isLoading, isAuthenticated, user, authContext]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Digital Psychological Support</Text>
        <Text style={styles.subtitle}>For College Students</Text>
        <ActivityIndicator 
          size="large" 
          color={Colors.white} 
          style={styles.loader}
        />
        <Text style={styles.loadingText}>
          {isLoading ? 'Initializing...' : 'Redirecting...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '400' as const,
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '400' as const,
    opacity: 0.7,
  },
});