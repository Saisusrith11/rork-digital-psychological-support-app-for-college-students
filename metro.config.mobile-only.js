/* eslint-env node */
/* global __dirname */
/**
 * Metro configuration for React Native
 * This configuration forces mobile-only operation and prevents any web bundling
 * 
 * To use this configuration:
 * 1. Rename this file to metro.config.js
 * 2. Delete any existing metro.config.js
 * 3. Restart your development server
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// CRITICAL: Force mobile-only platforms
config.resolver.platforms = ['ios', 'android'];

// Remove 'web' from any platform lists
if (config.resolver.platforms.includes('web')) {
  config.resolver.platforms = config.resolver.platforms.filter(p => p !== 'web');
}

// Block ALL web-related files
config.resolver.blockList = [
  // Block web-specific files
  /\.web\.[jt]sx?$/,
  /\.web\.ts$/,
  /_ctx\.web\.js$/,
  /_ctx\.web\.tsx$/,
  
  // Block webpack configurations
  /webpack\.config\..*/,
  
  // Block backend files
  /backend\/.*/,
  
  // Block node_modules web files
  /node_modules\/.*\.web\..*/,
  /node_modules\/expo-router\/_ctx\.web\..*/,
  
  // Block react-native-web
  /node_modules\/react-native-web\/.*/,
];

// Ensure proper source extensions for mobile only
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json'];

// Handle SVG files
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Custom resolver to force mobile context
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block any web platform requests
  if (platform === 'web') {
    throw new Error(`Web platform is not supported. Module: ${moduleName}`);
  }
  
  // Block expo-router web context
  if (moduleName.includes('_ctx.web')) {
    // Return mobile context instead
    const mobileContext = moduleName.replace('_ctx.web', '_ctx');
    return originalResolveRequest ? 
      originalResolveRequest(context, mobileContext, platform) :
      context.resolveRequest(context, mobileContext, platform);
  }
  
  // Use original resolver for everything else
  return originalResolveRequest ? 
    originalResolveRequest(context, moduleName, platform) :
    context.resolveRequest(context, moduleName, platform);
};

// Ensure app directory is properly resolved
config.watchFolders = [path.resolve(__dirname, 'app')];

// Disable web-related transformations
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

console.log('Metro configured for MOBILE ONLY operation');
console.log('Platforms:', config.resolver.platforms);

module.exports = config;