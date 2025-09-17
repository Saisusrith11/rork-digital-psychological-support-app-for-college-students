const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Try to find Platform.js in various possible locations
const possiblePlatformPaths = [
  path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/Platform.js'),
  path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/Platform/index.js'),
  path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/Platform.native.js'),
];

let platformPath = null;
for (const possiblePath of possiblePlatformPaths) {
  if (fs.existsSync(possiblePath)) {
    platformPath = possiblePath;
    console.log('Found Platform.js at:', platformPath);
    break;
  }
}

// Fallback: try to resolve using require.resolve
if (!platformPath) {
  try {
    platformPath = require.resolve('react-native/Libraries/Utilities/Platform');
    console.log('Resolved Platform.js using require.resolve:', platformPath);
  } catch (error) {
    console.warn('Could not resolve Platform.js:', error.message);
    // Create a minimal Platform implementation as fallback
    platformPath = path.resolve(__dirname, 'platform-fallback.js');
    const fallbackContent = `
module.exports = {
  OS: 'ios',
  Version: '1.0',
  constants: {},
  select: (obj) => obj.default || obj.native || obj.ios,
  isPad: false,
  isTVOS: false,
};
`;
    if (!fs.existsSync(platformPath)) {
      fs.writeFileSync(platformPath, fallbackContent);
      console.log('Created fallback Platform.js at:', platformPath);
    }
  }
}

// Enhanced alias resolution for React Native 0.79+ Platform issues
config.resolver.alias = {
  ...config.resolver.alias,
  // Multiple alias patterns to catch all Platform resolution attempts
  '../Utilities/Platform': platformPath,
  '../../Utilities/Platform': platformPath,
  './Platform': platformPath,
  'react-native/Libraries/Utilities/Platform': platformPath,
  '../../../Utilities/Platform': platformPath,
  '../../../../Utilities/Platform': platformPath,
  // Additional common patterns
  'Platform': platformPath,
  './Utilities/Platform': platformPath,
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

// Transformer settings with additional stability options
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Additional stability settings
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
];

// Additional resolver configuration for better stability
config.resolver.unstable_enableSymlinks = false;
config.resolver.unstable_enablePackageExports = false;

// Ensure we're using the correct resolver
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native'];

console.log('Metro configured for mobile platforms:', config.resolver.platforms);
console.log('Platform aliases configured:', Object.keys(config.resolver.alias).filter(key => key.includes('Platform')));
console.log('Using Platform.js from:', platformPath);

module.exports = config;