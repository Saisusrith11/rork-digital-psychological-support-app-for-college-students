import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

export default function IndexScreen() {
  const authContext = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Safely destructure auth context
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const isLoading = authContext?.isLoading ?? true;

  useEffect(() => {
    console.log('[IndexScreen] Auth state:', { user: !!user, isAuthenticated, isLoading });
    
    if (isLoading) {
      console.log('[IndexScreen] Still loading...');
      return;
    }

    if (!isAuthenticated) {
      console.log('[IndexScreen] Not authenticated, redirecting to auth');
      router.replace('/auth');
      return;
    }

    // Route based on user role
    if (user?.role === 'counselor') {
      console.log('[IndexScreen] Redirecting to counselor dashboard');
      router.replace('/(counselor)/dashboard');
    } else if (user?.role === 'admin') {
      console.log('[IndexScreen] Redirecting to admin dashboard');
      router.replace('/(admin)/dashboard');
    } else if (user?.role === 'volunteer') {
      console.log('[IndexScreen] Redirecting to volunteer dashboard');
      router.replace('/(volunteer)/dashboard');
    } else {
      console.log('[IndexScreen] Redirecting to student home');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.text}>Loading...</Text>
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
  },
  text: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '500' as const,
  },
});