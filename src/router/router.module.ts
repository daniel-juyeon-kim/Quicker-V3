import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';

const routeModules = [ChatModule, UserModule];

@Module({
  imports: [...routeModules],
})
export class RouteModule {}
