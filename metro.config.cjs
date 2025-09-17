const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enforce mobile-only build to avoid web-mode issues
config.resolver = config.resolver || {};
config.resolver.blockList = [
	/backend\/.*/,
	/\.web\..*/,
	/webpack\.config\.js/,
];
config.resolver.platforms = ['ios', 'android', 'native'];

module.exports = config;