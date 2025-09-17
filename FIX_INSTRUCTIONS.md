# Fix Navigation Error Instructions

## The Problem
Your app is trying to load Expo Router (`_ctx.web.js`) even though you've migrated to React Navigation. The `useAuth()` hook is returning undefined because the app is loading the wrong entry point.

## Quick Fix Steps

### Option 1: Run the Fix Script (Recommended)
```bash
chmod +x COMPLETE_FIX.sh
./COMPLETE_FIX.sh
bun install
expo start --clear
```

### Option 2: Manual Fix
1. **Fix package.json**
   - Change `"main": "expo-router/entry"` to `"main": "App.js"`
   - Remove expo-router from dependencies

2. **Use mobile-only metro config**
   ```bash
   cp metro.config.mobile-only.js metro.config.js
   ```

3. **Clean everything**
   ```bash
   rm -rf .expo node_modules/.cache
   rm -rf node_modules/expo-router
   rm -rf node_modules/@expo/webpack-config
   rm -rf node_modules/react-native-web
   ```

4. **Reinstall and run**
   ```bash
   bun install
   expo start --clear
   ```

## What This Fixes
- Removes all Expo Router references
- Forces the app to use React Navigation only
- Ensures App.js is the entry point
- Blocks any web-related files from loading
- Makes sure AuthProvider wraps the app correctly

## Verification
After running the fix, you should:
1. NOT see any `_ctx.web.js` errors
2. The app should load with React Navigation
3. `useAuth()` should work properly
4. No "source.uri should not be an empty string" warnings

## If Issues Persist
Try:
```bash
npx expo start --clear --reset-cache
```

Or completely reinstall node_modules:
```bash
rm -rf node_modules
rm bun.lockb
bun install
expo start --clear
```