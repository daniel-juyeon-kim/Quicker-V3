import { registerAs } from '@nestjs/config';

export const tmapApiConfig = registerAs('tmapApi', () => ({
  tmapApiKey: process.env.TMAP_API_KEY,
}));
