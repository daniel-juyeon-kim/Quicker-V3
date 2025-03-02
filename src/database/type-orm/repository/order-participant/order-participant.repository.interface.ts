import { OrderSenderReceiverDto } from '@src/router/order-sender-receiver/dto/order-sender-receiver.dto';

export interface IOrderParticipantRepository {
  findSenderReceiverLocationAndPhoneNumberByOrderId(
    orderId: number,
  ): Promise<OrderSenderReceiverDto>;
}
