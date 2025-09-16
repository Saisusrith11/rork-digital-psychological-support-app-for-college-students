/**
 * Mobile-only entry point
 * This bypasses expo-router completely and uses React Navigation directly
 */

import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Prevent web platform from loading
if (Platform.OS === 'web') {
  throw new Error('Web platform is not supported. This app is configured for mobile only.');
}

// Register the app for mobile platforms only
registerRootComponent(App);

export default App;