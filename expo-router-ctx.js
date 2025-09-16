// Custom context file for Expo Router web compatibility
// This file provides a working context for Expo Router on web

// Use a relative path that webpack can resolve
export const ctx = require.context(
  './app',
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/,
  'lazy'
);