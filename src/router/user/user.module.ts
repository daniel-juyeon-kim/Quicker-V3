import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [{ provide: ServiceToken.USER_SERVICE, useClass: UserService }],
})
export class UserModule {}
