import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { dbPkCreatorConfig } from './config';

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
