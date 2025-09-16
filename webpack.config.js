const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

// Set the app root environment variable
process.env.EXPO_ROUTER_APP_ROOT = process.env.EXPO_ROUTER_APP_ROOT || path.resolve(process.cwd(), 'app');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    // Ensure the app root is correctly set
    projectRoot: process.cwd(),
  }, argv);
  
  // Exclude all backend files from client bundle
  config.module.rules.unshift({
    test: /backend[\\/\\].*\.(ts|js)$/,
    use: 'null-loader',
  });
  
  // Exclude server-only API routes from client bundle (but not .native.ts files)
  config.module.rules.unshift({
    test: /app[\\/\\]api[\\/\\].*\.ts$/,
    exclude: /app[\\/\\]api[\\/\\].*\.native\.ts$/,
    use: 'null-loader',
  });
  
  // Add resolve aliases to prevent backend imports
  config.resolve.alias = {
    ...config.resolve.alias,
    // Prevent any backend imports
    [path.resolve(process.cwd(), 'backend')]: false,
    // Ensure app directory is properly resolved
    '@': path.resolve(process.cwd()),
  };
  
  // Ensure proper module resolution
  config.resolve.modules = [
    path.resolve(process.cwd(), 'node_modules'),
    'node_modules',
    path.resolve(process.cwd()),
  ];
  
  // Fix Expo Router context resolution
  if (config.plugins) {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(path.resolve(process.cwd(), 'app')),
      }),
      {
        apply: (compiler) => {
          compiler.hooks.normalModuleFactory.tap('ExpoRouterContextFix', (factory) => {
            factory.hooks.beforeResolve.tap('ExpoRouterContextFix', (resolveData) => {
              if (resolveData.request && resolveData.request.includes('../../../../app')) {
                resolveData.request = resolveData.request.replace('../../../../app', './app');
              }
            });
          });
        }
      }
    );
  }
  
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false,
    "crypto": false,
    "stream": false,
    "util": false,
    "buffer": false,
    "process": false,
    "os": false,
    "net": false,
    "tls": false,
    "child_process": false,
    "http": false,
    "https": false,
    "url": false,
    "querystring": false,
  };
  
  // Ignore server-only packages
  config.externals = {
    ...config.externals,
    'hono': 'commonjs hono',
    '@hono/trpc-server': 'commonjs @hono/trpc-server',
  };
  
  return config;
};