import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { MessageInfo } from '@src/database';
import { IChatMessageRepository } from '@src/database/mongoose/repository/chat-message/chat-message.repository.interface';
import { IChatService } from './chat.service.interface';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @Inject(RepositoryToken.CHAT_MESSAGE_REPOSITORY)
    private readonly chatMessageRepository: IChatMessageRepository,
  ) {}

  async findRecentMessageByOrderId(orderId: number): Promise<MessageInfo> {
    return await this.chatMessageRepository.findRecentMessageByOrderId(orderId);
  }
}
