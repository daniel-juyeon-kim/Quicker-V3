import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [{ provide: ServiceToken.ORDER_SERVICE, useClass: OrdersService }],
})
export class OrdersModule {}
