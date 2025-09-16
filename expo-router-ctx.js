// Custom context file for Expo Router web compatibility
// This file provides a working context for Expo Router on web

// Create a context that matches Expo Router's expectations
// The regex pattern matches Expo Router's requirements
let ctx;

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
  } catch (error) {
    console.warn('Failed to create context for expo-router, using fallback:', error);
    
    // Fallback context that properly implements the webpack context interface
    const fallbackContext = function(id) {
      // Return empty module for any requested file
      return { default: null };
    };
    fallbackContext.keys = function() { return []; };
    fallbackContext.resolve = function(id) { return id; };
    fallbackContext.id = './app';
    
    ctx = fallbackContext;
  }
} else {
  // For environments without require.context
  const fallbackContext = function(id) {
    return { default: null };
  };
  fallbackContext.keys = function() { return []; };
  fallbackContext.resolve = function(id) { return id; };
  fallbackContext.id = './app';
  
  ctx = fallbackContext;
}

// Export the context in the format Expo Router expects
exports.ctx = ctx;
module.exports = { ctx };