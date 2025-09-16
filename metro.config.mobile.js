/* eslint-env node */
/* global __dirname */
// This file ensures mobile-only operation and prevents web bundling issues
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude web-specific files and backend code from Metro bundling
config.resolver.blockList = [
  /backend\/.*/,
  /\.web\..*/,
  /webpack\.config\.js/,
];

// Only support mobile platforms
config.resolver.platforms = ['ios', 'android', 'native'];

module.exports = config;