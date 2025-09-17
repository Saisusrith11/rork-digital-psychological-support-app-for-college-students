import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';

export default function IndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('[IndexScreen] App starting...', { isLoading, isAuthenticated, userRole: user?.role });
    
    if (isLoading) {
      console.log('[IndexScreen] Still loading auth state...');
      return;
    }

    if (isAuthenticated && user) {
      console.log('[IndexScreen] User authenticated, redirecting based on role:', user.role);
      // Navigate based on user role
      if (user.role === 'counselor') {
        router.replace('/(counselor)/dashboard');
      } else if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (user.role === 'volunteer') {
        router.replace('/(volunteer)/dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
    } else {
      console.log('[IndexScreen] User not authenticated, redirecting to auth');
      const timer = setTimeout(() => {
        router.replace('/auth');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [router, isLoading, isAuthenticated, user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.text}>Digital Psychological Support</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Loading...' : 'Redirecting...'}
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
  text: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '400' as const,
    opacity: 0.8,
  },
});