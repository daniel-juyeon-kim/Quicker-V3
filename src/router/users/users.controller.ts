import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { ValidateWalletAddressPipe } from '@src/core/pipe/wallet-address-pipe/wallet-address.pipe';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { IUsersService } from './users.service.interface';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(ServiceToken.USER_SERVICE)
    private readonly service: IUsersService,
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUsersDto) {
    await this.service.createUser(dto);
  }

  @Get(':walletAddress/name')
  async findUserName(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.service.findUserNameByWalletAddress(walletAddress);
  }

  @Get(':walletAddress/profile-image/id')
  async findUserProfileImageId(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.service.findUserProfileImageIdByWalletAddress(
      walletAddress,
    );
  }

  @Patch(':walletAddress/profile-image/id')
  async updateUserProfileImageId(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
    @Body() dto: UpdateUsersDto,
  ) {
    await this.service.updateUserProfileImageId({
      walletAddress,
      ...dto,
    });
  }
}
