import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { IOrderSenderReceiverService } from './order-sender-receiver.service.interface';

@Controller('orders')
export class OrderSenderReceiverController {
  constructor(
    @Inject(ServiceToken.ORDER_SENDER_RECEIVER_SERVICE)
    private readonly orderSenderReceiverService: IOrderSenderReceiverService,
  ) {}

  @Get(':orderId/sender-receiver')
  findSenderReceiverLocationAndPhoneNumber(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderSenderReceiverService.findSenderReceiverLocationAndPhoneNumberByOrderId(
      orderId,
    );
  }
}
