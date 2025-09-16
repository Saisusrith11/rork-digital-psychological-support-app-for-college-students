const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
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
  };
  
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