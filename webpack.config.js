const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Exclude server files from client bundle
  config.module.rules.push({
    test: /backend\/(hono|server|trpc\/create-context)\.ts$/,
    use: 'null-loader',
  });
  
  // Mark server dependencies as external
  config.externals = {
    ...config.externals,
    '@trpc/server': 'commonjs @trpc/server',
    '@hono/trpc-server': 'commonjs @hono/trpc-server',
    'hono': 'commonjs hono',
  };
  
  return config;
};