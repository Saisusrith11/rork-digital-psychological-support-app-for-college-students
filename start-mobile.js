#!/usr/bin/env node
/* eslint-env node */

/**
 * Mobile-only startup script
 * This script ensures the app starts in mobile-only mode
 * 
 * Usage: node start-mobile.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting app in MOBILE-ONLY mode...\n');

// Check if running with web flag
if (process.argv.includes('--web')) {
  console.error('❌ ERROR: Web mode is not supported!');
  console.error('This app is configured for mobile only.');
  console.error('Use one of the following commands:');
  console.error('  • expo start');
  console.error('  • expo start --android');
  console.error('  • expo start --ios');
  process.exit(1);
}

// Ensure metro config is set for mobile only
const metroConfigPath = path.join(__dirname, 'metro.config.js');
const mobileConfigPath = path.join(__dirname, 'metro.config.mobile.js');

if (fs.existsSync(mobileConfigPath)) {
  console.log('✅ Using mobile-only Metro configuration');
}

// Set environment variables to force mobile mode
process.env.EXPO_PLATFORM = 'mobile';
process.env.DISABLE_WEB = 'true';

// Remove any web-related cache
const webCachePaths = [
  '.expo/web',
  'node_modules/.cache/webpack',
  'node_modules/.cache/babel-loader',
];

webCachePaths.forEach(cachePath => {
  const fullPath = path.join(__dirname, cachePath);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️  Removing web cache: ${cachePath}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Start expo with mobile-only flags
const args = ['rork', 'start', '-p', '5x33ga8jdiyfyd44xmhzq', '--tunnel'];

// Add platform if specified
if (process.argv.includes('--android')) {
  args.push('--android');
} else if (process.argv.includes('--ios')) {
  args.push('--ios');
}

console.log('\n📱 Starting Expo in mobile-only mode...');
console.log(`Command: bunx ${args.join(' ')}\n`);

const expo = spawn('bunx', args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PLATFORM: 'mobile',
    DISABLE_WEB: 'true',
  },
});

expo.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error);
  process.exit(1);
});

expo.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Expo exited with code ${code}`);
  }
  process.exit(code);
});