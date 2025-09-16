/// <reference types="expo/types" />

// Set the app root for Expo Router
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_ROUTER_APP_ROOT?: string;
    }
  }
}

export {};