import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import {
  keyCreatorConfig,
  klaytnConfig,
  naverSmsApiConfig,
  slackbotConfig,
  tmapApiConfig,
} from '@src/config/configs';
import { Klaytn } from './blockchain';
import { NaverSmsApi, SlackBot, TmapApi } from './external-api';
import { KeyCreator } from './key-creator';

const coreServices: Provider[] = [
  Klaytn,
  SlackBot,
  NaverSmsApi,
  TmapApi,
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
  ],
  providers: [...coreServices, webClient],
  exports: [...coreServices],
})
export class CoreModule {}
