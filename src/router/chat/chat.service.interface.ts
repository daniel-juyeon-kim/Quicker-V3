import { ChatMessageDto } from './dto/chat-message.dto';

export interface IChatService {
  findRecentMessageByOrderId(orderId: number): Promise<ChatMessageDto>;
}
