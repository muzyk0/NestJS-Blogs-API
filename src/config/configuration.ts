export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  BASE_PREFIX: process.env.BASE_PREFIX ?? '',
  BASE_URL: process.env.BASE_URL ?? 'http://localhost:3000',
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET ?? 'this is secret code for token',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ?? 'this is refresh code for token',
  SMTP: {
    EMAIL_FROM: process.env.EMAIL_FROM || '',
    EMAIL_FROM_PASSWORD: process.env.EMAIL_FROM_PASSWORD || '',
  },
  IS_DEV: process.env.NODE_ENV === 'development',
});
