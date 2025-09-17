const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for React Native 0.79+ Platform resolution issues
// This resolves the "Unable to resolve ../Utilities/Platform" error
config.resolver.alias = {
  ...config.resolver.alias,
  '../Utilities/Platform': path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/Platform'),
  '../../Utilities/Platform': path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/Platform'),
  './Platform': path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/Platform'),
  'react-native/Libraries/Utilities/Platform': path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/Platform'),
};

// Mobile-only configuration
config.resolver.platforms = ['ios', 'android', 'native'];
config.resolver.blockList = [
  /backend\/.*/,
  /\.web\..*/,
  /webpack\.config\..*/,
];

// Ensure proper module resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Additional resolver settings for stability
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'];

// Handle asset extensions
config.resolver.assetExts = [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif', 'svg'];

// Transformer settings
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

console.log('Metro configured for mobile platforms:', config.resolver.platforms);

module.exports = config;