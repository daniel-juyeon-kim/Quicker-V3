import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { KeyCreator } from '@src/core/module';
import { IUserRepository } from '@src/database';
import { IUserService } from './user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(RepositoryToken.USER_REPOSITORY)
    private readonly repository: IUserRepository,
    private readonly dbUserPkCreator: KeyCreator,
  ) {}

  async createUser({ walletAddress, name, email, contact, birthDate }) {
    const user = {
      walletAddress,
      name,
      email,
      contact,
    };

    const userBirthDateObject = new Date(birthDate);
    const id = this.dbUserPkCreator.createDbUserId(user.contact);

    await this.repository.create({ user, birthDate: userBirthDateObject, id });
  }

  async findUserNameByWalletAddress(walletAddress: string) {
    return await this.repository.findNameByWalletAddress(walletAddress);
  }

  async findUserImageId(walletAddress: string) {
    return await this.repository.findUserProfileImageIdByWalletAddress(
      walletAddress,
    );
  }

  async updateUserImageId({ imageId, walletAddress }) {
    await this.repository.updateUserProfileImageIdByWalletAddress({
      imageId,
      walletAddress,
    });
  }
}
