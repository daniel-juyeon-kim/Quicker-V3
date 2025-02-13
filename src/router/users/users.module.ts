import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [{ provide: ServiceToken.USER_SERVICE, useClass: UsersService }],
})
export class UsersModule {}
