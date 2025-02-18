import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { KeyCreator } from '@src/core/module';
import { IUserRepository } from '@src/database';
import { CreateUserDto } from './dto/create-user.dto';
import { IUserService } from './user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(RepositoryToken.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly dbUserPkCreator: KeyCreator,
  ) {}

  async createUser({
    walletAddress,
    name,
    email,
    contact,
    birthDate,
  }: CreateUserDto) {
    const user = {
      walletAddress,
      name,
      email,
      contact,
    };

    const id = this.dbUserPkCreator.createDbUserId(user.contact);

    await this.userRepository.createUser({
      id,
      user,
      birthDate,
    });
  }

  async findUserNameByWalletAddress(walletAddress: string) {
    return await this.userRepository.findNameByWalletAddress(walletAddress);
  }

  async findUserProfileImageIdByWalletAddress(walletAddress: string) {
    return await this.userRepository.findUserProfileImageIdByWalletAddress(
      walletAddress,
    );
  }

  async updateUserProfileImageId({ imageId, walletAddress }) {
    await this.userRepository.updateUserProfileImageIdByWalletAddress({
      imageId,
      walletAddress,
    });
  }
}
