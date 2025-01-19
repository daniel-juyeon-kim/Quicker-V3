import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import klaytnConfig from './common/core/blockchain/klaytnApi/config';
import slackBotConfig from './common/core/external-api/slack/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : ['.env', '.env.local'],
      isGlobal: true,
      load: [klaytnConfig, slackBotConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
