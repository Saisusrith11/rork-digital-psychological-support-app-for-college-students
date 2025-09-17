/// <reference types="expo/types" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_ROUTER_APP_ROOT: string;
      EXPO_PUBLIC_RORK_API_BASE_URL?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;
      S3_ACCESS_KEY?: string;
      S3_SECRET_KEY?: string;
      S3_REGION?: string;
      S3_BUCKET?: string;
      S3_PUBLIC_BASE_URL?: string;
    }
  }
}

export {};