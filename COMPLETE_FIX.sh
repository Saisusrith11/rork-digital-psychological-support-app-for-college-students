#!/bin/bash

echo "==================================="
echo "COMPLETE NAVIGATION FIX SCRIPT"
echo "==================================="

# Step 1: Backup current files
echo "Step 1: Creating backups..."
cp package.json package.json.backup 2>/dev/null
cp metro.config.js metro.config.js.backup 2>/dev/null

# Step 2: Fix package.json
echo "Step 2: Fixing package.json..."
cat > package.json << 'EOF'
{
  "name": "expo-app",
  "main": "App.js",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start --clear",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@hono/trpc-server": "^0.4.0",
    "@nkzw/create-context-hook": "^1.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "^7.4.7",
    "@react-navigation/drawer": "^7.5.8",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/native-stack": "^7.3.26",
    "@react-navigation/stack": "^7.4.8",
    "@stardazed/streams-text-encoding": "^1.0.2",
    "@tanstack/react-query": "^5.83.0",
    "@trpc/client": "^11.5.1",
    "@trpc/react-query": "^11.5.1",
    "@trpc/server": "^11.5.1",
    "@ungap/structured-clone": "^1.3.0",
    "expo": "^53.0.4",
    "expo-blur": "~14.1.4",
    "expo-constants": "~17.1.4",
    "expo-crypto": "~14.1.5",
    "expo-document-picker": "~13.1.6",
    "expo-file-system": "~18.1.11",
    "expo-font": "~13.3.0",
    "expo-haptics": "~14.1.4",
    "expo-image": "~2.1.6",
    "expo-image-picker": "~16.1.4",
    "expo-linear-gradient": "~14.1.4",
    "expo-linking": "~7.1.4",
    "expo-location": "~18.1.4",
    "expo-splash-screen": "~0.30.7",
    "expo-status-bar": "~2.2.3",
    "expo-symbols": "~0.4.4",
    "expo-system-ui": "~5.0.6",
    "expo-web-browser": "^14.2.0",
    "hono": "^4.9.7",
    "lucide-react-native": "^0.475.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-native": "0.79.1",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-safe-area-context": "5.3.0",
    "react-native-screens": "~4.10.0",
    "react-native-svg": "15.11.2",
    "resend": "^6.0.3",
    "superjson": "^2.2.2",
    "zod": "^4.1.8",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.0.10",
    "eslint": "^9.31.0",
    "eslint-config-expo": "^9.2.0",
    "typescript": "~5.8.3"
  },
  "private": true
}
EOF

# Step 3: Use mobile-only metro config
echo "Step 3: Setting up mobile-only metro config..."
cp metro.config.mobile-only.js metro.config.js

# Step 4: Clean caches
echo "Step 4: Cleaning all caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Step 5: Remove problematic modules
echo "Step 5: Removing expo-router and web modules..."
rm -rf node_modules/expo-router
rm -rf node_modules/@expo/webpack-config
rm -rf node_modules/react-native-web

# Step 6: Clear watchman (if available)
if command -v watchman &> /dev/null; then
    echo "Clearing watchman..."
    watchman watch-del-all
fi

echo ""
echo "==================================="
echo "FIX COMPLETE!"
echo "==================================="
echo ""
echo "Now run these commands:"
echo "1. bun install (or npm install)"
echo "2. expo start --clear"
echo ""
echo "The app should now run without expo-router errors!"