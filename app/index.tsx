import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        console.log('[IndexScreen] Redirecting to terms');
        router.replace('/terms');
      } catch (error) {
        console.error('[IndexScreen] Navigation error:', error);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Digital Psychological Support</Text>
          <Text style={styles.subtitle}>For College Students</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={Colors.text.white} 
            style={styles.loader}
          />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.replace('/terms')}
        >
          <Text style={styles.skipText}>Skip to App</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Mental Health Support Platform</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.text.white,
    fontSize: 32,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: '400' as const,
    opacity: 0.9,
    textAlign: 'center' as const,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '500' as const,
    opacity: 0.8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '400' as const,
    opacity: 0.6,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  skipText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '500' as const,
  },
});