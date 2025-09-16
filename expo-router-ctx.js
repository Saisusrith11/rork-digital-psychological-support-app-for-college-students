// Custom context file for Expo Router web compatibility
// This file provides a working context for Expo Router on web

// Create a context that matches Expo Router's expectations
// The regex pattern matches Expo Router's requirements
let ctx;

// Function to create a proper fallback context
function createFallbackContext() {
  const fallbackContext = function(id) {
    try {
      // Try to dynamically import the module
      return require(id);
    } catch (_error) {
      // Return empty module for any requested file that fails
      return { default: null };
    }
  };
  
  fallbackContext.keys = function() { 
    // Return empty array as we can't enumerate files in fallback mode
    return []; 
  };
  
  fallbackContext.resolve = function(id) { 
    return id; 
  };
  
  fallbackContext.id = './app';
  
  return fallbackContext;
}

if (typeof require.context === 'function') {
  try {
    // Standard webpack context for the app directory
    ctx = require.context(
      './app',
      true,
      /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/
    );
    
    // Ensure ctx has all required properties
    if (!ctx.keys) {
      ctx.keys = () => [];
    }
    if (!ctx.resolve) {
      ctx.resolve = (id) => id;
    }
    if (!ctx.id) {
      ctx.id = './app';
    }
    
    console.log('Expo Router context created successfully with', ctx.keys().length, 'files');
  } catch (error) {
    console.warn('Failed to create context for expo-router, using fallback:', error.message);
    ctx = createFallbackContext();
  }
} else {
  // For environments without require.context
  console.warn('require.context not available, using fallback context');
  ctx = createFallbackContext();
}

// Ensure the context is properly exported
if (!ctx) {
  console.error('Context creation failed, creating emergency fallback');
  ctx = createFallbackContext();
}

// Export the context in the format Expo Router expects
exports.ctx = ctx;
module.exports = { ctx };

// Also export as default for ES6 imports
module.exports.default = { ctx };