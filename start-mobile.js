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

// Check if we're in the right directory
const packagePath = path.join(process.cwd(), 'package.json');

if (fs.existsSync(packagePath)) {
  console.log('✅ Found package.json');
} else {
  console.error('❌ package.json not found');
  process.exit(1);
}

// Set environment variables
process.env.EXPO_NO_INTERACTIVE = '1';

// Start with expo
const command = 'npx';
const args = ['expo', 'start', '--clear'];

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