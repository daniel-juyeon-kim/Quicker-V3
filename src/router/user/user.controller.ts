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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserService } from './user.service.interface';

@Controller('users')
export class UserController {
  constructor(
    @Inject(ServiceToken.USER_SERVICE)
    private readonly userService: IUserService,
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    await this.userService.createUser(dto);
  }

  @Get(':walletAddress/name')
  async findUserName(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.userService.findUserNameByWalletAddress(walletAddress);
  }

  @Get(':walletAddress/profile-image/id')
  async findUserProfileImageId(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.userService.findUserProfileImageIdByWalletAddress(
      walletAddress,
    );
  }

  @Patch(':walletAddress/profile-image/id')
  async updateUserProfileImageId(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
    @Body() dto: UpdateUserDto,
  ) {
    await this.userService.updateUserProfileImageId({
      walletAddress,
      ...dto,
    });
  }
}
