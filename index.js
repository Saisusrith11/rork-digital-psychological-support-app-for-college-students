// Debug entry point
console.log('[Entry] Starting app...');

try {
  // Import expo-router entry
  require('expo-router/entry');
  console.log('[Entry] Expo router loaded successfully');
} catch (error) {
  console.error('[Entry] Failed to load expo-router:', error);
  throw error;
}