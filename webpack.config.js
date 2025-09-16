const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    projectRoot: process.cwd(),
  }, argv);
  
  // Exclude all backend files from client bundle
  config.module.rules.unshift({
    test: /backend[\\/\\].*\.(ts|js)$/,
    use: 'null-loader',
  });
  
  // More specific exclusion for server-only API routes
  config.module.rules.unshift({
    test: /app[\\/\\]api[\\/\\]\[\[.*route\]\]\.ts$/,
    use: {
      loader: 'null-loader',
      options: {
        // Completely exclude from bundle
        exclude: true
      }
    },
  });
  
  // General API route exclusion (but not .native.ts files)
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
    // Replace server-only API routes with client stub
    [path.resolve(process.cwd(), 'app/api/[[...route]].ts')]: path.resolve(process.cwd(), 'app/api/[[...route]].client.ts'),
    // Ensure app directory is properly resolved
    '@': path.resolve(process.cwd()),
    // Direct alias for expo-router context
    'expo-router/_ctx.web': path.resolve(process.cwd(), 'expo-router-ctx.js'),
    'expo-router/_ctx.web.js': path.resolve(process.cwd(), 'expo-router-ctx.js'),
  };
  
  // Ensure proper module resolution
  config.resolve.modules = [
    path.resolve(process.cwd(), 'node_modules'),
    'node_modules',
    path.resolve(process.cwd()),
  ];
  
  // Add a custom plugin to handle context resolution
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /expo-router[/\\]_ctx\.web(\.js)?$/,
      path.resolve(process.cwd(), 'expo-router-ctx.js')
    )
  );
  
  // Also handle the direct _ctx.web import
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /_ctx\.web$/,
      path.resolve(process.cwd(), 'expo-router-ctx.js')
    )
  );
  
  // Define EXPO_ROUTER_APP_ROOT for the build
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(path.resolve(process.cwd(), 'app')),
    })
  );
  
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
  
  // Add ignore plugin to completely exclude server files
  const IgnorePlugin = webpack.IgnorePlugin;
  config.plugins.push(
    new IgnorePlugin({
      resourceRegExp: /^\.\/\[\[.*route\]\]\.ts$/,
      contextRegExp: /app\/api$/,
    })
  );
  
  config.plugins.push(
    new IgnorePlugin({
      resourceRegExp: /backend/,
    })
  );
  
  return config;
};