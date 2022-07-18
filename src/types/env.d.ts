declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      BASE_PREFIX: string;
      BASE_URL: string;
      MONGO_URI: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      EMAIL_FROM: string;
      EMAIL_FROM_PASSWORD: string;
    }
  }
}

export {};
