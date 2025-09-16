const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

// Use process.cwd() as the base directory
const projectRoot = process.cwd();

module.exports = async function (env, argv) {
  // Validate argv parameter
  if (!argv || typeof argv !== 'object') {
    argv = {};
  }
  
  // Set the app root environment variable before creating config
  const appRoot = path.resolve(projectRoot, 'app');
  process.env.EXPO_ROUTER_APP_ROOT = appRoot;
  
  // Ensure the app directory exists
  const fs = require('fs');
  if (!fs.existsSync(appRoot)) {
    throw new Error(`App directory not found at: ${appRoot}`);
  }
  
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@trpc/client', '@tanstack/react-query']
    }
  }, argv);
  
  // Ensure EXPO_ROUTER_APP_ROOT is set correctly in DefinePlugin as well
  config.plugins = config.plugins || [];
  const DefinePlugin = require('webpack').DefinePlugin;
  config.plugins.push(
    new DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(path.resolve(projectRoot, 'app'))
    })
  );

  // Add fallback for Node.js modules
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    buffer: false,
    util: false,
    path: false,
    fs: false,
    os: false,
    net: false,
    tls: false,
    child_process: false,
    http: false,
    https: false,
    zlib: false,
    url: false
  };

  // Add alias to ensure correct app directory resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(projectRoot),
    'app': path.resolve(projectRoot, 'app')
  };
  
  // Ensure proper module resolution
  config.resolve.modules = [
    path.resolve(projectRoot, 'node_modules'),
    'node_modules'
  ];
  
  // Add extensions for proper resolution
  config.resolve.extensions = [
    '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
    '.tsx', '.ts', '.jsx', '.js', '.json'
  ];

  // Ignore server-side modules and backend code
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  
  // Use null-loader for backend files
  config.module.rules.push({
    test: /backend[\\/].*\.(ts|tsx|js|jsx)$/,
    use: 'null-loader'
  });
  
  // Exclude @trpc/server from client bundle
  config.module.rules.push({
    test: /@trpc[\\/]server/,
    use: 'null-loader'
  });
  
  // Exclude hono from client bundle
  config.module.rules.push({
    test: /hono/,
    use: 'null-loader'
  });
  
  // Fix for expo-router context resolution
  // Override the context resolution to use the correct app directory
  config.resolve.context = projectRoot;
  
  // Add a custom plugin to handle the context resolution
  const ContextReplacementPlugin = require('webpack').ContextReplacementPlugin;
  config.plugins.push(
    new ContextReplacementPlugin(
      /expo-router\/_ctx\.web\.js$/,
      appRoot
    )
  );

  return config;
};