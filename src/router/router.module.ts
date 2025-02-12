import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { OrderAverageModule } from './order-average/order-average.module';
import { OrderDeliveryPersonModule } from './order-delivery-person/order-delivery-person.module';
import { OrderCompleteImageService } from './order-image/order-complete-image/order-complete-image.service';
import { OrderFailImageService } from './order-image/order-fail-image/order-fail-image.service';
import { OrderImageModule } from './order-image/order-image.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';

const routeModules = [
  ChatModule,
  UserModule,
  OrderModule,
  OrderAverageModule,
  OrderDeliveryPersonModule,
];

@Module({
  imports: [...routeModules, OrderImageModule],
  providers: [OrderFailImageService, OrderCompleteImageService],
})
export class RouteModule {}
