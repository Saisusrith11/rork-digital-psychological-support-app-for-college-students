// Custom context file for Expo Router web compatibility
// This file provides a working context for Expo Router on web

// Create a context that matches Expo Router's expectations
// The regex excludes API routes and special files
const ctx = require.context(
  './app',
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*\.[tj]sx?$/
);

// Export the context in the format Expo Router expects
export { ctx };
export default ctx;