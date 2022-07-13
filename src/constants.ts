export const PORT = process.env.PORT ?? 5000;

/**
 * This is base URL for API.
 * @use "/api"
 */
export const BASE_PREFIX = process.env.BASE_PREFIX ?? '';
export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

export const MONGO_URI: string = process.env.MONGO_URI;

export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ?? 'this is secret code for token';

export enum BaseAuthPayload {
  login = 'admin',
  password = 'qwerty',
}

export const EMAIL_FROM = process.env.EMAIL_FROM || '';
export const EMAIL_FROM_PASSWORD = process.env.EMAIL_FROM_PASSWORD || '';

export const settings = {
  PORT,
  BASE_PREFIX,
  BASE_URL,
  MONGO_URI,
  ACCESS_TOKEN_SECRET,
  EMAIL_FROM,
  EMAIL_FROM_PASSWORD,
};
