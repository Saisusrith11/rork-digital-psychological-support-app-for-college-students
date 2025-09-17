const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Simple and direct Platform resolution
config.resolver.alias = {
  ...config.resolver.alias,
  // Direct mapping for Platform resolution issues
  '../Utilities/Platform': 'react-native/Libraries/Utilities/Platform',
  '../../Utilities/Platform': 'react-native/Libraries/Utilities/Platform',
  './Platform': 'react-native/Libraries/Utilities/Platform',
};

// Ensure mobile-only platforms
config.resolver.platforms = ['ios', 'android', 'native'];

// Block web-related files
config.resolver.blockList = [
  /backend\/.*/,
  /\.web\..*/,
  /webpack\.config\..*/,
];

// Standard resolver settings
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

console.log('Simple Metro config loaded for mobile platforms');

module.exports = config;