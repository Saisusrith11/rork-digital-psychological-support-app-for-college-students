const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  if (!env || typeof env !== 'object') {
    env = {};
  }
  
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@expo/vector-icons']
    }
  }, argv);

  const projectRoot = process.cwd();

  // Set the EXPO_ROUTER_APP_ROOT environment variable for web builds
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'DefinePlugin') {
      plugin.definitions['process.env.EXPO_ROUTER_APP_ROOT'] = JSON.stringify(path.resolve(projectRoot, 'app'));
    }
  });

  // Ensure proper alias resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': projectRoot,
  };

  return config;
};