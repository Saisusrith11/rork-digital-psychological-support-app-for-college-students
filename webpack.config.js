const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  if (!env || !argv) {
    throw new Error('Environment and arguments are required');
  }
  
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Ensure proper resolution for Expo Router
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(process.cwd(), './'),
  };
  
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "assert": false,
    "http": false,
    "https": false,
    "os": false,
    "url": false,
  };
  
  return config;
};