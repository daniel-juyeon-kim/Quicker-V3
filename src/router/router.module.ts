import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { OrderAverageModule } from './order-average/order-average.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';

const routeModules = [ChatModule, UserModule, OrderModule, OrderAverageModule];

@Module({
  imports: [...routeModules],
})
export class RouteModule {}
