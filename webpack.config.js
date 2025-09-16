const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Exclude all backend files from client bundle
  config.module.rules.push({
    test: /backend[\/\\].*\.(ts|js)$/,
    use: 'null-loader',
  });
  
  // Exclude server-only API routes from client bundle
  config.module.rules.push({
    test: /app[\/\\]api[\/\\].*\.ts$/,
    exclude: /app[\/\\]api[\/\\].*\.native\.ts$/,
    use: 'null-loader',
  });
  
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
  };
  
  return config;
};