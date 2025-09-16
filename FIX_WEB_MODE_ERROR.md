# Fix for Expo Router Web Mode Error

## Problem
The app is trying to load `_ctx.web.js` which causes the error:
```
Module not found: Can't resolve '../../../../../app'
```

This happens because the system is attempting to run in web mode, which is not supported for this mobile-only application.

## Solution

### Option 1: Use Custom App Entry (Recommended)
The `App.tsx` file has been created to bypass Expo Router's web context entirely:

1. The app now uses a custom entry point that directly imports the root layout
2. It includes platform detection to prevent web mode
3. Falls back gracefully if Expo Router context fails

### Option 2: Force Mobile-Only Metro Configuration
A `metro.config.mobile-only.js` file has been created that:
- Forces platforms to iOS and Android only
- Blocks all web-related files
- Prevents webpack from running

To use it:
1. Back up your current `metro.config.js`
2. Copy `metro.config.mobile-only.js` to `metro.config.js`
3. Clear cache: `expo start -c`

### Option 3: Use Mobile-Only Startup Script
Run the app using the custom startup script:
```bash
node start-mobile.js
```

This script:
- Prevents web mode from starting
- Clears web-related caches
- Sets environment variables to force mobile mode

### Option 4: Patch Expo Router (Last Resort)
If the error persists, run:
```bash
node expo-router-fix.js
```

This patches the expo-router package to redirect web context to mobile.

## Prevention

### Always use mobile-specific commands:
```bash
# Good - Mobile only
expo start
expo start --android
expo start --ios

# Bad - Never use these
expo start --web
npm run start-web
```

### Environment Setup
Set these environment variables:
```bash
export EXPO_PLATFORM=mobile
export DISABLE_WEB=true
```

### Clear Caches Regularly
```bash
# Clear all caches
expo start -c

# Remove web-specific caches
rm -rf .expo/web
rm -rf node_modules/.cache/webpack
```

## Verification

To verify the fix is working:
1. The app should start without the `_ctx.web.js` error
2. Console should show "Metro configured for MOBILE ONLY operation"
3. No webpack processes should be running
4. The app should work on Android/iOS simulators or devices

## If Issues Persist

1. **Complete Reset:**
   ```bash
   rm -rf node_modules
   rm -rf .expo
   npm install
   expo start -c
   ```

2. **Check package.json:**
   - Ensure `"main"` points to `"App.tsx"` or custom entry
   - Remove any web-specific scripts

3. **Verify no web dependencies:**
   - Check that `@expo/webpack-config` is not being used
   - Ensure `react-native-web` is not imported anywhere

## Technical Details

The root cause is that Expo Router tries to create different contexts for web vs mobile platforms. When the bundler gets confused about which platform to target, it defaults to web mode, causing the error.

Our fixes work by:
1. Explicitly telling the system to use mobile-only mode
2. Blocking web file resolution at the Metro bundler level
3. Providing a custom entry point that bypasses Expo Router's platform detection
4. Patching the problematic files directly

This is a known issue with Expo Router when used in complex, production apps with multiple user roles and backend integrations.