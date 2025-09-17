import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('[IndexScreen] App starting...');
    // Simple redirect to auth for now
    const timer = setTimeout(() => {
      router.replace('/auth');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.text}>Digital Psychological Support</Text>
        <Text style={styles.subtitle}>Loading...</Text>
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