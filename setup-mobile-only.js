#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Setting up mobile-only React Native app...');
console.log('📱 Removing Expo Router, using React Navigation');
console.log('');

// Step 1: Update package.json
console.log('📦 Updating package.json...');
if (fs.existsSync('package-mobile.json')) {
  fs.copyFileSync('package-mobile.json', 'package.json');
  console.log('✅ Updated package.json to mobile-only version');
} else {
  console.log('⚠️  package-mobile.json not found, manually update package.json');
}

// Step 2: Update app.json
console.log('📱 Updating app.json...');
if (fs.existsSync('app-mobile.json')) {
  fs.copyFileSync('app-mobile.json', 'app.json');
  console.log('✅ Updated app.json to mobile-only version');
} else {
  console.log('⚠️  app-mobile.json not found, manually update app.json');
}

// Step 3: Update metro.config.js
console.log('⚙️  Updating metro.config.js...');
if (fs.existsSync('metro.config.mobile.js')) {
  fs.copyFileSync('metro.config.mobile.js', 'metro.config.js');
  console.log('✅ Updated metro.config.js to mobile-only version');
} else {
  console.log('⚠️  metro.config.mobile.js not found, manually update metro.config.js');
}

console.log('');
console.log('🎉 Setup complete!');
console.log('');
console.log('🚀 To start your app:');
console.log('   1. Run: npm install (to update dependencies)');
console.log('   2. Run: expo start --android (for Android)');
console.log('   3. Run: expo start --ios (for iOS)');
console.log('   4. Or: expo start (then scan QR code)');
console.log('');
console.log('❌ DO NOT use: expo start --web');
console.log('');
console.log('📝 Note: Your app now uses React Navigation instead of Expo Router');
console.log('   All routing is handled through navigation/MainNavigator.js');
console.log('');