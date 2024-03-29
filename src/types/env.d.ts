declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      BASE_PREFIX: string;
      BASE_URL: string;
      MONGO_URI: string;
      POSTGRESQL_URI: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      IP_RESTRICTION_LIMIT: string;
      ENABLE_CLEAR_DB_ENDPOINT: string;
      TYPEORM_SSL: string;
      RMQ_URLS: string;
    }
  }
}

export {};
