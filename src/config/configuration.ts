export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  BASE_PREFIX: process.env.BASE_PREFIX ?? '',
  BASE_URL: process.env.BASE_URL ?? 'http://localhost:3000',
  MODE: process.env.MODE ?? 'sql',
  MONGO_URI: process.env.MONGO_URI,
  POSTGRESQL_URI: process.env.POSTGRESQL_URI,
  TYPEORM_SSL: Boolean(process.env.TYPEORM_SSL),
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET ?? 'this is secret code for token',
  ACCESS_TOKEN_SECRET_EXPIRES_IN:
    process.env.ACCESS_TOKEN_SECRET_EXPIRES_IN ?? '30m',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ?? 'this is refresh code for token',
  REFRESH_TOKEN_SECRET_EXPIRES_IN:
    process.env.REFRESH_TOKEN_SECRET_EXPIRES_IN ?? '60m',
  IS_DEV: process.env.NODE_ENV === 'development',
  IP_RESTRICTION: {
    LIMIT: process.env.IP_RESTRICTION_LIMIT
      ? Number(process.env.IP_RESTRICTION_LIMIT)
      : 5,
  },
  ENABLE_CLEAR_DB_ENDPOINT: process.env.ENABLE_CLEAR_DB_ENDPOINT === 'true',
  RMQ_URLS: process.env.RMQ_URLS,
  MESSAGE_SENDER_HOST: process.env.MESSAGE_SENDER_HOST,
  MESSAGE_SENDER_PORT: process.env.MESSAGE_SENDER_PORT,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  APP_VERSION: require('../../package.json').version,
});
