import { Injectable } from '@nestjs/common';
import {
  DuplicatedDataException,
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { UserNameDto } from '@src/router/user/dto/user-name.dto';
import { UserProfileImageIdDto } from '@src/router/user/dto/user-profile-image-id.dto';
import { plainToInstance } from 'class-transformer';
import {
  BirthDateEntity,
  JoinDateEntity,
  ProfileImageEntity,
  UserEntity,
} from '../../entity';
import { Transactional } from '../../util/transaction/decorator/transactional.decorator';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AbstractRepository } from '../abstract-repository';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository
  extends AbstractRepository<UserEntity>
  implements IUserRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(UserEntity);
  }

  @Transactional()
  async createUser({
    user,
    birthDate,
    id,
  }: {
    user: Pick<UserEntity, 'name' | 'walletAddress' | 'email' | 'contact'>;
    birthDate: Date;
    id: string;
  }) {
    try {
      const userExists = await this.getManager().existsBy(UserEntity, { id });

      if (userExists) {
        throw new DuplicatedDataException(id);
      }

      await this.getManager().insert(UserEntity, {
        id,
        ...user,
      });

      await this.getManager().insert(BirthDateEntity, {
        id,
        date: birthDate,
      });

      await this.getManager().insert(ProfileImageEntity, {
        id,
      });

      await this.getManager().insert(JoinDateEntity, {
        id,
      });
    } catch (error) {
      if (error instanceof DuplicatedDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findIdByWalletAddress(walletAddress: string): Promise<string> {
    const user = await this.getManager().findOne(UserEntity, {
      select: { id: true },
      where: { walletAddress },
    });

    this.validateNotNull(walletAddress, user);

    return user.id;
  }

  async findNameByWalletAddress(walletAddress: string) {
    try {
      const name = await this.getRepository().findOne({
        where: { walletAddress },
        select: { name: true },
      });

      this.validateNotNull(walletAddress, name);

      return plainToInstance(UserNameDto, name);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findProfileImageIdByWalletAddress(walletAddress: string) {
    try {
      const user = await this.getRepository().findOne({
        relations: { profileImage: true },
        where: { walletAddress },
        select: { profileImage: { imageId: true } },
      });

      this.validateNotNull(walletAddress, user);

      return plainToInstance(UserProfileImageIdDto, user.profileImage);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  @Transactional()
  async updateUserProfileImageIdByWalletAddress({
    walletAddress,
    imageId,
  }: {
    walletAddress: string;
    imageId: string;
  }) {
    try {
      const user = await this.getManager().findOneBy(UserEntity, {
        walletAddress,
      });

      this.validateNotNull(walletAddress, user);

      await this.getManager().update(
        ProfileImageEntity,
        { id: user.id },
        { imageId },
      );
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
