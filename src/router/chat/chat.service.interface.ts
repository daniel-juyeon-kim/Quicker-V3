import { MessageInfo } from '@src/database';

export interface IChatService {
  findRecentMessageByOrderId(orderId: number): Promise<MessageInfo>;
}
