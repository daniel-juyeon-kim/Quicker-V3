import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import {
  keyCreatorConfig,
  klaytnConfig,
  naverSmsApiConfig,
  slackbotConfig,
  tmapApiConfig,
} from '@src/core/config/configs';
import { CoreToken } from '../constant';
import { Klaytn } from './blockchain';
import { DeliveryUrlCreator } from './delivery-url-creator';
import { NaverSmsApi, SlackBot, TmapApi } from './external-api';
import { KeyCreator } from './key-creator';
import { FilterLoggersModule } from './filter-loggers/filter-loggers.module';

const coreServices: Provider[] = [
  Klaytn,
  {
    provide: CoreToken.ERROR_MESSAGE_BOT,
    useClass: SlackBot,
  },
  NaverSmsApi,
  TmapApi,
  DeliveryUrlCreator,
  KeyCreator,
];

const webClient = {
  provide: WebClient,
  useFactory: (config: ConfigType<typeof slackbotConfig>) =>
    new WebClient(config.token),
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(klaytnConfig),
    ConfigModule.forFeature(slackbotConfig),
    ConfigModule.forFeature(naverSmsApiConfig),
    ConfigModule.forFeature(tmapApiConfig),
    ConfigModule.forFeature(keyCreatorConfig),
    FilterLoggersModule,
  ],
  providers: [...coreServices, webClient],
  exports: [...coreServices],
})
export class CoreModule {}
