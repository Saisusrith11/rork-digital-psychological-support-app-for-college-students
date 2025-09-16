/**
 * Expo Router Mobile-Only Fix
 * 
 * This script patches the Expo Router to prevent web context loading
 * Run this before starting your development server
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying Expo Router mobile-only fix...\n');

// Find expo-router in node_modules
const expoRouterPath = path.join(process.cwd(), 'node_modules', 'expo-router');

if (!fs.existsSync(expoRouterPath)) {
  console.error('❌ expo-router not found in node_modules');
  process.exit(1);
}

// Patch _ctx.web.js to redirect to mobile context
const webCtxPath = path.join(expoRouterPath, '_ctx.web.js');
const webCtxTsxPath = path.join(expoRouterPath, '_ctx.web.tsx');

const mobileOnlyContent = `
// Patched to force mobile-only mode
if (typeof window !== 'undefined') {
  throw new Error('Web mode is not supported. Please use mobile platforms only.');
}
module.exports = require('./_ctx.js');
`;

// Patch both possible web context files
[webCtxPath, webCtxTsxPath].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Patching ${path.basename(filePath)}...`);
    fs.writeFileSync(filePath, mobileOnlyContent);
    console.log(`✅ Patched ${path.basename(filePath)}`);
  }
});

// Create a custom expo-router entry that forces mobile
const customEntryPath = path.join(process.cwd(), 'expo-router-entry.js');
const customEntryContent = `
// Custom Expo Router entry point - Mobile Only
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Prevent web platform
if (Platform.OS === 'web') {
  throw new Error('This app is configured for mobile platforms only');
}

// Import the app
const App = require('./app/_layout').default;

// Register for mobile platforms only
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  registerRootComponent(App);
}

export default App;
`;

fs.writeFileSync(customEntryPath, customEntryContent);
console.log('✅ Created custom entry point: expo-router-entry.js');

console.log('\n✨ Expo Router mobile-only fix applied successfully!');
console.log('\nNext steps:');
console.log('1. Clear your cache: expo start -c');
console.log('2. Start with: expo start --android or expo start --ios');
console.log('3. Never use: expo start --web');