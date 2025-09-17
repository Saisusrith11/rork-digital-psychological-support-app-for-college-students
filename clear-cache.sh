#!/bin/bash

echo "🧹 Clearing React Native and Metro caches..."

# Clear Metro cache
echo "Clearing Metro cache..."
npx expo start --clear

# Clear npm/yarn cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear watchman cache if available
if command -v watchman &> /dev/null; then
    echo "Clearing Watchman cache..."
    watchman watch-del-all
fi

# Remove node_modules and reinstall
echo "Removing node_modules..."
rm -rf node_modules

echo "Reinstalling dependencies..."
npm install

# Clear Expo cache
echo "Clearing Expo cache..."
npx expo install --fix

echo "✅ Cache cleared! Try running the app again."
echo "Run: npm start"