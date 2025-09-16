import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EnterCounselor() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let isMounted = true;
    const go = async () => {
      try {
        console.log('[EnterCounselor] Attempting demo counselor login');
        const res = await login('counselor', 'counselor123');
        if (!isMounted) return;
        if (res.success) {
          console.log('[EnterCounselor] Login success, routing to counselor dashboard');
          router.replace('/(counselor)/dashboard');
        } else {
          console.log('[EnterCounselor] Login failed', res.error);
          setError(res.error ?? 'Unable to sign in');
        }
      } catch (e) {
        console.log('[EnterCounselor] Unexpected error', e);
        setError('Something went wrong');
      }
    };
    go();
    return () => { isMounted = false; };
  }, [login]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} testID="enter-counselor-screen">
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#2E86FF" />
          <Text style={styles.infoText}>Preparing counselor dashboard…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0F14',
    paddingHorizontal: 24,
  },
  infoText: {
    marginTop: 12,
    color: '#E6EAF2',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 16,
    textAlign: 'center',
  },
});