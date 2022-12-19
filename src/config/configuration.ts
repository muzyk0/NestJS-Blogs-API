export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  BASE_PREFIX: process.env.BASE_PREFIX ?? '',
  BASE_URL: process.env.BASE_URL ?? 'http://localhost:3000',
  MONGO_URI: process.env.MONGO_URI,
  POSTGRESQL_URI: process.env.POSTGRESQL_URI,
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET ?? 'this is secret code for token',
  ACCESS_TOKEN_SECRET_EXPIRES_IN:
    process.env.ACCESS_TOKEN_SECRET_EXPIRES_IN ?? '30m',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ?? 'this is refresh code for token',
  REFRESH_TOKEN_SECRET_EXPIRES_IN:
    process.env.REFRESH_TOKEN_SECRET_EXPIRES_IN ?? '60m',
  SMTP: {
    EMAIL_FROM: process.env.EMAIL_FROM || '',
    EMAIL_FROM_PASSWORD: process.env.EMAIL_FROM_PASSWORD || '',
  },
  IS_DEV: process.env.NODE_ENV === 'development',
});
