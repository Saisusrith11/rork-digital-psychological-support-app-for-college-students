const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(process.cwd());

// Configure for mobile platforms only
config.resolver.platforms = ['ios', 'android', 'native'];

// Block web and backend files
config.resolver.blockList = [
  /backend\/.*/,
  /\.web\..*/,
  /webpack\.config\..*/,
];

// Standard resolver settings
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

// Ensure proper module resolution
config.resolver.nodeModulesPaths = [
  path.resolve(process.cwd(), 'node_modules'),
];

// Disable symlinks and package exports for stability
config.resolver.unstable_enableSymlinks = false;
config.resolver.unstable_enablePackageExports = false;

console.log('Metro configured for mobile platforms:', config.resolver.platforms);

module.exports = config;