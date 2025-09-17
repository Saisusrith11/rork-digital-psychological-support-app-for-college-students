import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

export default function IndexScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth');
      return;
    }

    // Route based on user role
    if (user?.role === 'counselor') {
      router.replace('/(counselor)/dashboard');
    } else if (user?.role === 'admin') {
      router.replace('/(admin)/dashboard');
    } else if (user?.role === 'volunteer') {
      router.replace('/(volunteer)/dashboard');
    } else {
      // Default to student tabs
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