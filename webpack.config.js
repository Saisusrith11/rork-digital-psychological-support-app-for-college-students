const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      projectRoot: process.cwd(),
    },
    argv,
  );

  // Define EXPO_ROUTER_APP_ROOT for the context
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(
        path.resolve(process.cwd(), 'app')
      ),
    }),
  );

  // Exclude all backend files from client bundle
  config.module.rules.unshift({
    test: /backend[\\/].*\.(ts|js)$/,
    use: 'null-loader',
  });

  // More specific exclusion for server-only API routes
  config.module.rules.unshift({
    test: /app[\\/]api[\\/]\[\[.*route\]\]\.ts$/,
    use: {
      loader: 'null-loader',
      options: {
        exclude: true,
      },
    },
  });

  // General API route exclusion (but not .native.ts files)
  config.module.rules.unshift({
    test: /app[\\/]api[\\/].*\.ts$/,
    exclude: /app[\\/]api[\\/].*\.native\.ts$/,
    use: 'null-loader',
  });

  // Add resolve aliases
  config.resolve.alias = {
    ...config.resolve.alias,
    [path.resolve(process.cwd(), 'backend')]: false,
    [path.resolve(process.cwd(), 'app/api/[[...route]].ts')]: path.resolve(
      process.cwd(),
      'app/api/[[...route]].client.ts',
    ),
    '@': path.resolve(process.cwd()),
    'expo-router/_ctx.web': path.resolve(process.cwd(), 'expo-router-ctx.js'),
  };

  // Add specific alias for the problematic path resolution
  const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
  const expoRouterPath = path.join(nodeModulesPath, 'expo-router');
  
  // Override the expo-router context resolution
  config.resolve.alias[path.join(expoRouterPath, '_ctx.web.js')] = path.resolve(process.cwd(), 'expo-router-ctx.js');
  config.resolve.alias['../../../../../app'] = path.resolve(process.cwd(), 'app');
  config.resolve.alias['../../../../app'] = path.resolve(process.cwd(), 'app');
  config.resolve.alias['../../../app'] = path.resolve(process.cwd(), 'app');
  config.resolve.alias['../../app'] = path.resolve(process.cwd(), 'app');
  config.resolve.alias['../app'] = path.resolve(process.cwd(), 'app');

  // Ensure proper module resolution
  config.resolve.modules = [
    path.resolve(process.cwd(), 'node_modules'),
    'node_modules',
    path.resolve(process.cwd()),
  ];

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    crypto: false,
    stream: false,
    util: false,
    buffer: false,
    process: false,
    os: false,
    net: false,
    tls: false,
    child_process: false,
    http: false,
    https: false,
    url: false,
    querystring: false,
  };

  // Ignore server-only packages
  config.externals = {
    ...config.externals,
    hono: 'commonjs hono',
    '@hono/trpc-server': 'commonjs @hono/trpc-server',
  };

  // Add ignore plugin to completely exclude server files
  const IgnorePlugin = webpack.IgnorePlugin;
  config.plugins.push(
    new IgnorePlugin({
      resourceRegExp: /^\.\/\[\[.*route\]\]\.ts$/,
      contextRegExp: /app\/api$/,
    }),
  );

  config.plugins.push(
    new IgnorePlugin({
      resourceRegExp: /backend/,
    }),
  );

  // Add a custom plugin to handle expo-router context resolution
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /expo-router\/_ctx\.web/,
      path.resolve(process.cwd(), 'expo-router-ctx.js')
    )
  );

  // Replace any relative path resolution to app directory
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/app$/,
      path.resolve(process.cwd(), 'app')
    )
  );

  return config;
};