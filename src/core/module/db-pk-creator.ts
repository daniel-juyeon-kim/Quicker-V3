import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { dbPkCreatorConfig } from '@src/core/config/configs';
import crypto from 'crypto';

@Injectable()
export class DbPkCreator {
  private readonly key: string;

  constructor(
    configService: ConfigService<ReturnType<typeof dbPkCreatorConfig>>,
  ) {
    this.key = configService.get('cryptoKey');
  }

  createUserPk(phoneNumber: string) {
    return crypto
      .createHmac('sha256', this.key)
      .update(phoneNumber)
      .digest('hex');
  }
}
