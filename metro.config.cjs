const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Simple, clean configuration for mobile-only build
config.resolver.platforms = ['ios', 'android', 'native'];
config.resolver.blockList = [
  /backend\/.*/,
  /\.web\..*/,
];

module.exports = config;