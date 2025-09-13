import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
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
            break;
        }
      } else {
        router.replace('/auth');
      }
    }
  }, [user, isAuthenticated, isLoading]);

  return (
    <View testID="index-screen" style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});