import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';

export default function IndexScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (user) {
          console.log('[IndexScreen] User found, redirecting based on role');
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
          console.log('[IndexScreen] No user found, redirecting to auth');
          router.replace('/auth');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [router, user, isLoading]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Digital Psychological Support</Text>
        <Text style={styles.subtitle}>For College Students</Text>
        <ActivityIndicator 
          size="large" 
          color={Colors.text.white} 
          style={styles.loader}
        />
        <Text style={styles.loadingText}>
          {isLoading ? 'Loading...' : 'Initializing...'}
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
    color: Colors.text.white,
    fontSize: 28,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: '400' as const,
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '400' as const,
    opacity: 0.7,
  },
});