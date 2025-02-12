import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { OrderAverageModule } from './order-average/order-average.module';
import { OrderDeliveryPersonModule } from './order-delivery-person/order-delivery-person.module';
import { OrderImageModule } from './order-image/order-image.module';
import { OrderLocationModule } from './order-location/order-location.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';

const routeModules = [
  ChatModule,
  UserModule,
  OrderModule,
  OrderAverageModule,
  OrderDeliveryPersonModule,
  OrderImageModule,
  OrderLocationModule,
];

@Module({
  imports: [...routeModules],
  providers: [],
})
export class RouteModule {}
