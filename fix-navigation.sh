#!/bin/bash

echo "Fixing navigation setup..."

# Backup current package.json
cp package.json package.json.backup

# Copy fixed package.json
cp package-fixed.json package.json

# Remove expo-router and webpack from node_modules
rm -rf node_modules/expo-router
rm -rf node_modules/@expo/webpack-config
rm -rf node_modules/react-native-web

# Clear metro cache
rm -rf .expo
rm -rf node_modules/.cache

echo "Navigation setup fixed! Now run:"
echo "1. npm install (or bun install)"
echo "2. expo start --clear"