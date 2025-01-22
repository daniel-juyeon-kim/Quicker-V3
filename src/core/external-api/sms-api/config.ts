import { registerAs } from '@nestjs/config';

export const naverSmsApiConfig = registerAs('naverSmsApi', () => ({
  accesskey: process.env.NHN_API_ACCESSKEY,
  secretkey: process.env.NHN_API_SECRETKEY,
  serviceId: process.env.NHN_API_SERVICEID,
  fromNumber: process.env.NHN_API_FROMNUMBER,
}));
