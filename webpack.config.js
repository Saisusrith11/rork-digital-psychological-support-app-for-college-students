const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@trpc/client', '@tanstack/react-query']
    }
  }, argv);
  
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