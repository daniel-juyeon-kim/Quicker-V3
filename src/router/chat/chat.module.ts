import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [{ provide: ServiceToken.CHAT_SERVICE, useClass: ChatService }],
})
export class ChatModule {}
