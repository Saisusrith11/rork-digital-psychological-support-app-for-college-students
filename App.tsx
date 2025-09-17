// Custom App wrapper to ensure mobile-only operation
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import RootLayout from './app/_layout';

// Force mobile-only mode
if (Platform.OS === 'web') {
  const WebError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>This app is configured for mobile only.</Text>
      <Text style={styles.errorSubtext}>Please use expo start --android or expo start --ios</Text>
    </View>
  );
  registerRootComponent(WebError);
} else {
  // Mobile app entry point - RootLayout already has ErrorBoundary
  registerRootComponent(RootLayout);
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default RootLayout;