const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@trpc/client', '@tanstack/react-query']
    }
  }, argv);
  
  // Fix Expo Router app directory resolution
  const appDir = path.resolve(process.cwd(), 'app');
  
  // Override the context module factory to properly resolve app directory
  config.plugins = config.plugins || [];
  const webpack = require('webpack');
  
  // Define the app root for Expo Router
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(appDir)
    })
  );
  
  // Add proper alias for app directory resolution
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@/app': appDir,
    'app': appDir
  };
  
  // Add fallback for Node.js modules
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