import { ConfigModule } from '@nestjs/config';
import {
  dbPkCreatorConfig,
  keyCreatorConfig,
  klaytnConfig,
  mongooseConfig,
  naverSmsApiConfig,
  slackbotConfig,
  tmapApiConfig,
  typeOrmConfig,
} from './configs';

const configs = [
  klaytnConfig,
  slackbotConfig,
  naverSmsApiConfig,
  tmapApiConfig,
  keyCreatorConfig,
  dbPkCreatorConfig,
  typeOrmConfig,
  mongooseConfig,
];

export const rootConfigModule = ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
  isGlobal: true,
  load: [...configs],
});
