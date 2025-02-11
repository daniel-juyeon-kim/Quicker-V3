import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrderDeliveryPersonController } from './order-delivery-person.controller';
import { OrderDeliveryPersonService } from './order-delivery-person.service';

@Module({
  controllers: [OrderDeliveryPersonController],
  providers: [
    {
      provide: ServiceToken.ORDER_DELIVERY_PERSON_SERVICE,
      useClass: OrderDeliveryPersonService,
    },
  ],
})
export class OrderDeliveryPersonModule {}
