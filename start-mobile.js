#!/usr/bin/env node
/* eslint-env node */

/**
 * Mobile-only startup script
 * This script ensures the app starts in mobile-only mode
 * 
 * Usage: node start-mobile.js
 */

const { spawn, spawnSync } = require('child_process');
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
const mobileConfigPath = path.join(process.cwd(), 'metro.config.mobile.js');

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
  const fullPath = path.join(process.cwd(), cachePath);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️  Removing web cache: ${cachePath}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Utility to check if a command exists
function commandExists(cmd) {
  try {
    const result = spawnSync('sh', ['-lc', `command -v ${cmd}`], { stdio: 'ignore' });
    return result.status === 0;
  } catch (_) {
    return false;
  }
}

// Decide which launcher to use
const hasBunx = commandExists('bunx');
const useRork = hasBunx && !process.argv.includes('--no-rork');

let command;
let args = [];

if (useRork) {
  // Prefer Rork if available
  command = 'bunx';
  args = ['rork', 'start', '-p', '5x33ga8jdiyfyd44xmhzq', '--tunnel', '--no-interactive', '--config', 'metro.config.mobile.js'];
  if (process.argv.includes('--android')) args.push('--android');
  if (process.argv.includes('--ios')) args.push('--ios');
  console.log('\n📱 Starting with Rork (bunx)...');
  console.log(`Command: ${command} ${args.join(' ')}\n`);
} else {
  // Fallback to Expo CLI via npx
  command = 'npx';
  args = ['--yes', 'expo', 'start', '--tunnel', '--no-interactive', '--config', 'metro.config.mobile.js'];
  if (process.argv.includes('--android')) args.push('--android');
  if (process.argv.includes('--ios')) args.push('--ios');
  console.log('\n📱 Starting with Expo CLI (npx)...');
  console.log(`Command: ${command} ${args.join(' ')}\n`);
}

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PLATFORM: 'mobile',
    DISABLE_WEB: 'true',
    EXPO_NO_INTERACTIVE: '1',
  },
});

child.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Development server exited with code ${code}`);
  }
  process.exit(code);
});