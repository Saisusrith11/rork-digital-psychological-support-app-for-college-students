const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(process.cwd());

// Configure for all platforms
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Standard resolver settings
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'cjs'];

// Ensure proper module resolution
config.resolver.nodeModulesPaths = [
  path.resolve(process.cwd(), 'node_modules'),
];

// Configure transformer for better compatibility
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable symlinks and package exports
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

console.log('Metro configured for platforms:', config.resolver.platforms);

module.exports = config;