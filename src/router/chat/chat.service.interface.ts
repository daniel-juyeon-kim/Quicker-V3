import { MessageInfo } from '@src/database';

export interface IChatService {
  findRecentMessage(roomId: number): Promise<MessageInfo>;
}
