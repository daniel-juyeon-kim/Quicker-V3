import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

@Module({
  controllers: [ChatsController],
  providers: [{ provide: ServiceToken.CHAT_SERVICE, useClass: ChatsService }],
})
export class ChatsModule {}
