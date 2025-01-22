import { registerAs } from '@nestjs/config';

export const keyCreatorConfig = registerAs('urlCryptoKey', () => ({
  urlCryptoKey: process.env.URL_CRYPTO_KEY,
}));

export const dbPkCreatorConfig = registerAs('dbPkCreatorKey', () => ({
  cryptoKey: process.env.CRYPTO_KEY,
}));
