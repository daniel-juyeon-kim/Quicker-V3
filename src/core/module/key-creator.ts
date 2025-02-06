import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { keyCreatorConfig } from '@src/core/config/configs';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

@Injectable()
export class KeyCreator {
  private readonly key: string;

  constructor(config: ConfigService<ReturnType<typeof keyCreatorConfig>>) {
    this.key = config.get('urlCryptoKey');
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
