import { OrderEntity } from '../../entity';

export interface IOrderParticipantRepository {
  findSenderReceiverInfoByOrderId(orderId: number): Promise<OrderEntity>;
}
