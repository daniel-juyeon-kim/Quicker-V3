import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrderLocationController } from './order-location.controller';
import { OrderLocationService } from './order-location.service';

@Module({
  controllers: [OrderLocationController],
  providers: [
    {
      provide: ServiceToken.ORDER_LOCATION_SERVICE,
      useClass: OrderLocationService,
    },
  ],
})
export class OrderLocationModule {}
