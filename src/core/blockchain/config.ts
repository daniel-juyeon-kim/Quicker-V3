import { registerAs } from '@nestjs/config';

export const klaytnConfig = registerAs('klaytn', () => ({
  baobobProvider: process.env.KLAYTN_BAOBAB_PROVIDER,
  accessKeyId: process.env.KLAYTN_ACCESSKEY_ID,
  secretKey: process.env.KLAYTN_SECRET_KEY,
  deligationPublicKey: process.env.KLAYTN_DELIGATION_PUBLIC_KEY,
  deligationPrivateKey: process.env.KLAYTN_DELIGATION_PRIVATE_KEY,
}));
