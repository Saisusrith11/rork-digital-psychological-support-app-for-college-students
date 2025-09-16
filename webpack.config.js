const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  // Set environment variable before creating config
  process.env.EXPO_ROUTER_APP_ROOT = path.resolve(process.cwd(), 'app');
  
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@trpc/client', '@tanstack/react-query']
    }
  }, argv);
  
  // Fix Expo Router context resolution
  const appPath = path.resolve(process.cwd(), 'app');
  config.resolve.alias = {
    ...config.resolve.alias,
    '../../../../../app': appPath,
    '../../../../app': appPath,
    '../../../app': appPath,
    '../../app': appPath,
    '../app': appPath,
    'app': appPath
  };
  
  // Add module resolution for expo-router context
  config.resolve.modules = [
    ...(config.resolve.modules || []),
    path.resolve(process.cwd()),
    'node_modules'
  ];
  
  // Set EXPO_ROUTER_APP_ROOT environment variable in webpack
  config.plugins = config.plugins || [];
  const webpack = require('webpack');
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify('./app')
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

  return config;
};