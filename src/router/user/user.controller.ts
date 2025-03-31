import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ServiceToken } from '@src/core/constant';
import { ValidateWalletAddressPipe } from '@src/core/pipe/wallet-address-pipe/wallet-address.pipe';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonConflictResponse } from '@src/core/response/dto/conflict-response';
import { ApiCommonCreatedResponse } from '@src/core/response/dto/created-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { ApiCommonOkResponse } from '@src/core/response/dto/ok-response';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNameResponseDto } from './dto/user-name.dto';
import { UserProfileImageIdResponseDto } from './dto/user-profile-image-id.dto';
import { IUserService } from './user.service.interface';

@Controller('users')
export class UserController {
  constructor(
    @Inject(ServiceToken.USER_SERVICE)
    private readonly userService: IUserService,
  ) {}

  @Post()
  @ApiOperation({
    description: '사용자 생성',
  })
  @ApiCommonCreatedResponse
  @ApiCommonBadRequestResponse
  @ApiCommonConflictResponse
  @ApiCommonInternalServerErrorResponse
  async createUser(@Body() dto: CreateUserDto) {
    await this.userService.createUser(dto);
  }

  @Get(':walletAddress/name')
  @ApiOperation({
    description: '지갑주소에 해당되는 사용자의 이름을 가지고 옴',
  })
  @ApiOkResponse({ type: UserNameResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findUserName(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.userService.findUserNameByWalletAddress(walletAddress);
  }

  @Get(':walletAddress/profile-image/id')
  @ApiOperation({
    description: '지갑주소에 해당되는 사용자의 프로필 이미지를 가지고 옴',
  })
  @ApiOkResponse({ type: UserProfileImageIdResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findUserProfileImageId(
    @Param('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.userService.findUserProfileImageIdByWalletAddress(
      walletAddress,
    );
  }

  @Patch(':walletAddress/profile-image/id')
  @ApiOperation({
    description:
      '지갑주소에 해당되는 사용자의 프로필 이미지 아이디를 업데이트 함',
  })
  @ApiCommonOkResponse
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
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
