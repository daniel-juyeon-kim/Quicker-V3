import { Module } from '@nestjs/common';
import { ChatsModule } from './chats/chats.module';
import { OrderAverageModule } from './order-average/order-average.module';
import { OrderDeliveryPersonModule } from './order-delivery-person/order-delivery-person.module';
import { OrderImageModule } from './order-image/order-image.module';
import { OrderLocationModule } from './order-location/order-location.module';
import { OrdersModule } from './orders/orders.module';
import { SenderReceiverInfoModule } from './sender-receiver-info/sender-receiver-info.module';
import { UsersModule } from './users/users.module';

const routeModules = [
  ChatsModule,
  UsersModule,
  OrdersModule,
  OrderAverageModule,
  OrderDeliveryPersonModule,
  OrderImageModule,
  OrderLocationModule,
  SenderReceiverInfoModule,
];

@Module({
  imports: [...routeModules],
})
export class RouteModule {}
