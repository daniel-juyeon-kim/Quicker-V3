import { OrderSenderReceiverDto } from './dto/order-sender-receiver.dto';

export interface IOrderSenderReceiverService {
  findSenderReceiverLocationAndPhoneNumberByOrderId(
    orderId: number,
  ): Promise<OrderSenderReceiverDto>;
}
