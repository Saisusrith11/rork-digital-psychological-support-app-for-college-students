import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
// import { Colors } from '@/constants/colors';
// import { useAuth } from '@/hooks/auth-store';

// Temporary fallback colors
const Colors = {
  primary: '#007AFF',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

export default function IndexScreen() {
  const router = useRouter();
  // const authContext = useAuth();
  
  // Temporary simplified logic
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[IndexScreen] Redirecting to auth');
      router.replace('/auth');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

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
          Initializing...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
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