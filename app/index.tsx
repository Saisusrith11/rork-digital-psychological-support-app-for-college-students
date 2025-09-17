import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/auth-store';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/utils/navigation';

export default function IndexScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    console.log('[IndexScreen] Auth state:', { user: user?.role, isAuthenticated, isLoading });
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('[IndexScreen] Redirecting authenticated user:', user.role);
        switch (user.role) {
          case 'counselor':
            navigation.reset({
              index: 0,
              routes: [{ name: 'Counselor' }],
            });
            break;
          case 'admin':
            navigation.reset({
              index: 0,
              routes: [{ name: 'Admin' }],
            });
            break;
          case 'volunteer':
            navigation.reset({
              index: 0,
              routes: [{ name: 'Volunteer' }],
            });
            break;
          default:
            navigation.reset({
              index: 0,
              routes: [{ name: 'Student' }],
            });
            break;
        }
      } else {
        console.log('[IndexScreen] Redirecting to auth');
        navigation.navigate('AuthScreen');
      }
    }
  }, [user, isAuthenticated, isLoading, navigation]);

  return (
    <View testID="index-screen" style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
});