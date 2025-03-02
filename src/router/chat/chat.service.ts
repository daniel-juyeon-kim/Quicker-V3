import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IChatMessageRepository } from '@src/database/mongoose/repository/chat-message/chat-message.repository.interface';
import { IChatService } from './chat.service.interface';
import { ChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @Inject(RepositoryToken.CHAT_MESSAGE_REPOSITORY)
    private readonly chatMessageRepository: IChatMessageRepository,
  ) {}

  async findRecentMessageByOrderId(orderId: number): Promise<ChatMessageDto> {
    return await this.chatMessageRepository.findRecentMessageByOrderId(orderId);
  }
}
