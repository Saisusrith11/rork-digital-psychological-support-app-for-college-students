#!/bin/bash

echo "🚀 Starting mobile-only React Native app..."
echo "📱 Using React Navigation instead of Expo Router"
echo ""

# Copy the mobile-only package.json
if [ -f "package-mobile.json" ]; then
    echo "📦 Using mobile-only package.json..."
    cp package-mobile.json package.json
fi

# Use mobile-only metro config
if [ -f "metro.config.mobile.js" ]; then
    echo "⚙️  Using mobile-only metro config..."
    cp metro.config.mobile.js metro.config.js
fi

echo "✅ Configuration updated for mobile-only mode"
echo ""
echo "🔧 Now run one of these commands:"
echo "   expo start --android"
echo "   expo start --ios"
echo "   expo start (then scan QR code)"
echo ""
echo "❌ DO NOT use: expo start --web"
echo ""