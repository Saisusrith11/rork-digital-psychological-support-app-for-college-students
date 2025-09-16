// Custom context file for Expo Router web compatibility
// This file provides a working context for Expo Router on web

// Create a context that matches Expo Router's expectations
// The regex excludes API routes and special files
let ctx;

try {
  // Use the app directory relative to the project root
  ctx = require.context(
    '../app',
    true,
    /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*\.[tj]sx?$/
  );
} catch (error) {
  console.warn('Failed to create primary context for expo-router, trying alternative path:', error);
  
  try {
    // Alternative path resolution
    ctx = require.context(
      './app',
      true,
      /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*\.[tj]sx?$/
    );
  } catch (secondError) {
    console.warn('Failed to create alternative context for expo-router:', secondError);
    
    // Fallback empty context that properly implements the webpack context interface
    const fallbackContext = (id) => {
      console.warn(`Fallback context called with id: ${id}`);
      return null;
    };
    fallbackContext.keys = () => [];
    fallbackContext.resolve = (id) => id;
    fallbackContext.id = 'expo-router-fallback';
    
    ctx = fallbackContext;
  }
}

// Export the context in the format Expo Router expects
export { ctx };
export default ctx;