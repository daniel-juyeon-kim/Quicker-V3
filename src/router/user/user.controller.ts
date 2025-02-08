import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserService } from './user.service.interface';

@Controller('user')
export class UserController {
  constructor(
    @Inject(ServiceToken.USER_SERVICE)
    private readonly service: IUserService,
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    await this.service.createUser(dto);
  }

  @Get('name')
  async getUserName(@Query('walletAddress') walletAddress: string) {
    return await this.service.findUserNameByWalletAddress(walletAddress);
  }

  @Get('/image/id')
  async getUserImageId(@Query() walletAddress: string) {
    return await this.service.findUserImageId(walletAddress);
  }

  @Patch('/image/id')
  async updateUserImageId(@Body() { walletAddress, imageId }: UpdateUserDto) {
    await this.service.updateUserImageId({
      imageId,
      walletAddress,
    });
  }
}
