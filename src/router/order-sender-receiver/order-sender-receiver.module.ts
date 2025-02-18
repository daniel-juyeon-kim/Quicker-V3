import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrderSenderReceiverController } from './order-sender-receiver.controller';
import { OrderSenderReceiverService } from './order-sender-receiver.service';

@Module({
  controllers: [OrderSenderReceiverController],
  providers: [
    {
      provide: ServiceToken.ORDER_SENDER_RECEIVER_SERVICE,
      useClass: OrderSenderReceiverService,
    },
  ],
})
export class OrderSenderReceiverModule {}
