import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [{ provide: ServiceToken.ORDER_SERVICE, useClass: OrderService }],
})
export class OrderModule {}
