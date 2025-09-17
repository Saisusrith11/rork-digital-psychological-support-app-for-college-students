/**
 * Mobile-only entry point
 * This completely bypasses expo-router and uses React Navigation directly
 * NO WEB SUPPORT - MOBILE ONLY
 */

import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Completely block web platform
if (Platform.OS === 'web') {
  console.error('❌ Web platform is not supported. This app is configured for mobile only.');
  throw new Error('Web platform is not supported. This app is configured for mobile only.');
}

// Block any expo-router imports at runtime
if (typeof window !== 'undefined' && window.location) {
  throw new Error('Web environment detected. This app only supports mobile platforms.');
}

console.log('🚀 Starting mobile-only app with React Navigation');
console.log('📱 Platform:', Platform.OS);

// Register the app for mobile platforms only
registerRootComponent(App);

export default App;