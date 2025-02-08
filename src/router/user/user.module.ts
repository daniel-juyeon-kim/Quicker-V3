import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ServiceToken } from '@src/core/constant';

@Module({
  controllers: [UserController],
  providers: [{ provide: ServiceToken.USER_SERVICE, useClass: UserService }],
})
export class UserModule {}
