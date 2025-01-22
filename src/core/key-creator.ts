import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { keyCreatorConfig } from './config';

export class KeyCreator {
  private readonly key: string;

  constructor(
    configService: ConfigService<ReturnType<typeof keyCreatorConfig>>,
  ) {
    this.key = configService.get('urlCryptoKey');
  }

  createReceiverUrlParameterValue<T extends object>(
    body: T,
    cryptoKey: string,
  ) {
    return CryptoJS.AES.encrypt(JSON.stringify(body), cryptoKey).toString();
  }

  createDbUserId(phoneNumber: string) {
    return crypto
      .createHmac('sha256', this.key)
      .update(phoneNumber)
      .digest('hex');
  }
}
