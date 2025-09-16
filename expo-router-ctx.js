// Custom context file for Expo Router web compatibility
// This file provides a working context for Expo Router on web

// Create a context that matches Expo Router's expectations
// The regex excludes API routes and special files
let ctx;

try {
  ctx = require.context(
    './app',
    true,
    /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/
  );
} catch (error) {
  console.warn('Failed to create context for expo-router:', error);
  
  // Fallback empty context
  ctx = () => {};
  ctx.keys = () => [];
  ctx.resolve = (id) => id;
  ctx.id = 'expo-router-fallback';
}

// Export the context in the format Expo Router expects
export { ctx };
export default ctx;