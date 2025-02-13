import { MessageInfo } from '@src/database';

export interface IChatsService {
  findRecentMessageByOrderId(orderId: number): Promise<MessageInfo>;
}
