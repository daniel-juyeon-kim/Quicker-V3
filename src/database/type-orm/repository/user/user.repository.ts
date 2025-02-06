import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseError } from '@src/core/module';
import { Repository } from 'typeorm';
import {
  BirthDateEntity,
  JoinDateEntity,
  ProfileImageEntity,
  UserEntity,
} from '../../entity';
import { DuplicatedDataError, NotExistDataError } from '../../util';
import { AbstractRepository } from '../abstract-repository';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository
  extends AbstractRepository
  implements IUserRepository
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {
    super();
  }

  async create({
    user,
    birthDate,
    id,
  }: {
    user: Pick<UserEntity, 'name' | 'walletAddress' | 'email' | 'contact'>;
    birthDate: Date;
    id: string;
  }) {
    try {
      const userExists = await this.manager.existsBy(UserEntity, { id });

      if (userExists) {
        throw new DuplicatedDataError(
          `${id}에 해당하는 데이터가 이미 존재합니다.`,
        );
      }

      await this.manager.insert(UserEntity, {
        id,
        ...user,
      });

      await this.manager.insert(BirthDateEntity, {
        id,
        date: birthDate,
      });

      await this.manager.insert(ProfileImageEntity, {
        id,
      });

      await this.manager.insert(JoinDateEntity, {
        id,
      });
    } catch (error) {
      if (error instanceof DuplicatedDataError) {
        throw error;
      }
      throw new UnknownDataBaseError(error);
    }
  }

  async findNameByWalletAddress(walletAddress: string) {
    try {
      const name = await this.repository.findOne({
        where: { walletAddress },
        select: { name: true },
      });

      this.validateNotNull(walletAddress, name);

      return name;
    } catch (error) {
      if (error instanceof NotExistDataError) {
        throw new NotExistDataError(
          `지갑주소 ${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }

  async findUserProfileImageIdByWalletAddress(walletAddress: string) {
    try {
      const user = await this.repository.findOne({
        relations: { profileImage: true },
        where: { walletAddress },
        select: { profileImage: { imageId: true } },
      });

      this.validateNotNull(walletAddress, user);

      return user.profileImage;
    } catch (error) {
      if (error instanceof NotExistDataError) {
        throw new NotExistDataError(
          `지갑주소 ${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }

  async updateUserProfileImageIdByWalletAddress({
    walletAddress,
    imageId,
  }: {
    walletAddress: string;
    imageId: string;
  }) {
    try {
      const user = await this.manager.findOneBy(UserEntity, { walletAddress });

      this.validateNotNull(walletAddress, user);

      await this.manager.update(
        ProfileImageEntity,
        { id: user.id },
        { imageId },
      );
    } catch (error) {
      if (error instanceof NotExistDataError) {
        throw new NotExistDataError(
          `${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }
}
