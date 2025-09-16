/* eslint-env node */
/* eslint-disable no-undef */
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@trpc/client', '@trpc/react-query']
      }
    },
    argv
  );

  // Set the EXPO_ROUTER_APP_ROOT environment variable
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'DefinePlugin') {
      plugin.definitions['process.env.EXPO_ROUTER_APP_ROOT'] = JSON.stringify(
        path.resolve(__dirname, 'app')
      );
    }
  });

  // Add alias for the app directory
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname),
    'app': path.resolve(__dirname, 'app')
  };

  // Ensure proper module resolution
  config.resolve.modules = [
    path.resolve(__dirname, 'node_modules'),
    'node_modules'
  ];

  // Exclude server-side code from client bundle
  config.module.rules.push({
    test: /backend\/.*/,
    use: 'null-loader'
  });

  return config;
};