#!/usr/bin/env node
/* eslint-env node */

/**
 * Startup script for Mental Health Platform
 * This script starts the app with proper configuration
 * 
 * Usage: node start-mobile.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Mental Health Platform...\n');

// Ensure metro config exists
const configPath = path.join(process.cwd(), 'metro.config.mobile.js');

if (fs.existsSync(configPath)) {
  console.log('✅ Using Metro configuration');
}

// Set environment variables
process.env.EXPO_NO_INTERACTIVE = '1';

// Start with expo
const command = 'npx';
const args = ['expo', 'start', '--config', 'metro.config.mobile.js'];

// Add platform flags if specified
if (process.argv.includes('--android')) args.push('--android');
if (process.argv.includes('--ios')) args.push('--ios');
if (process.argv.includes('--web')) args.push('--web');
if (process.argv.includes('--tunnel')) args.push('--tunnel');

console.log(`\n📱 Starting with command: ${command} ${args.join(' ')}\n`);

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
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