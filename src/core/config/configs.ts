import { registerAs } from '@nestjs/config';

export const klaytnConfig = registerAs('klaytn', () => ({
  baobobProvider: process.env.KLAYTN_BAOBAB_PROVIDER,
  accessKeyId: process.env.KLAYTN_ACCESSKEY_ID,
  secretKey: process.env.KLAYTN_SECRET_KEY,
  deligationPublicKey: process.env.KLAYTN_DELIGATION_PUBLIC_KEY,
  deligationPrivateKey: process.env.KLAYTN_DELIGATION_PRIVATE_KEY,
}));

export const slackbotConfig = registerAs('slackbot', () => ({
  token: process.env.SLACK_BOT_TOKEN,
  channelId: process.env.SLACK_BOT_CHANNEL_ID,
}));

export const naverSmsApiConfig = registerAs('naverSmsApi', () => ({
  accesskey: process.env.NHN_API_ACCESSKEY,
  secretkey: process.env.NHN_API_SECRETKEY,
  serviceId: process.env.NHN_API_SERVICEID,
  fromNumber: process.env.NHN_API_FROMNUMBER,
}));

export const tmapApiConfig = registerAs('tmapApi', () => ({
  tmapApiKey: process.env.TMAP_API_KEY,
}));

export const keyCreatorConfig = registerAs('urlCryptoKey', () => ({
  urlCryptoKey: process.env.URL_CRYPTO_KEY,
  baseUrl: process.env.CLIENT_SERVER_DOMAIN,
}));

export const dbPkCreatorConfig = registerAs('dbPkCreatorKey', () => ({
  cryptoKey: process.env.CRYPTO_KEY,
}));

export const typeOrmConfig = registerAs('typeOrm', () => ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: parseInt(process.env.DB_PORT),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

export const mongooseConfig = registerAs('mongoose', () => ({
  uri: process.env.MONGO_DB_URI,
  dbName: process.env.MONGO_DB_NAME,
}));
