import { env } from './env';

export const GA_CONFIG = {
  credentials: {
    client_email: env.GA_CLIENT_EMAIL,
    private_key: env.GA_PRIVATE_KEY,
  },
}; 