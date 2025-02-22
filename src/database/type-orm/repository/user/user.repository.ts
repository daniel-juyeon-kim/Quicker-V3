import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseException } from '@src/core/module';
import { Repository } from 'typeorm';
import {
  BirthDateEntity,
  JoinDateEntity,
  ProfileImageEntity,
  UserEntity,
} from '../../entity';
import { DuplicatedDataException, NotExistDataException } from '../../util';
import { AbstractRepository } from '../abstract-repository';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository
  extends AbstractRepository
  implements IUserRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {
    super();
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
      const userExists = await this.txHost.tx
        .getRepository(UserEntity)
        .existsBy({ id });

      if (userExists) {
        throw new DuplicatedDataException(
          `${id}에 해당하는 데이터가 이미 존재합니다.`,
        );
      }

      await this.txHost.tx.getRepository(UserEntity).insert({
        id,
        ...user,
      });

      await this.txHost.tx.getRepository(BirthDateEntity).insert({
        id,
        date: birthDate,
      });

      await this.txHost.tx.getRepository(ProfileImageEntity).insert({
        id,
      });

      await this.txHost.tx.getRepository(JoinDateEntity).insert({
        id,
      });
    } catch (error) {
      if (error instanceof DuplicatedDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }

    //   const userExists = await this.manager.existsBy(UserEntity, { id });

    //   if (userExists) {
    //     throw new DuplicatedDataException(
    //       `${id}에 해당하는 데이터가 이미 존재합니다.`,
    //     );
    //   }

    //   await this.manager.insert(UserEntity, {
    //     id,
    //     ...user,
    //   });

    //   await this.manager.insert(BirthDateEntity, {
    //     id,
    //     date: birthDate,
    //   });

    //   await this.manager.insert(ProfileImageEntity, {
    //     id,
    //   });

    //   await this.manager.insert(JoinDateEntity, {
    //     id,
    //   });
    // } catch (error) {
    //   if (error instanceof DuplicatedDataException) {
    //     throw error;
    //   }
    //   throw new UnknownDataBaseException(error);
    // }
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
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException(
          `지갑주소 ${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
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
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException(
          `지갑주소 ${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
        );
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
      const user = await this.txHost.tx
        .getRepository(UserEntity)
        .findOneBy({ walletAddress });

      this.validateNotNull(walletAddress, user);

      await this.txHost.tx
        .getRepository(ProfileImageEntity)
        .update({ id: user.id }, { imageId });
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException(
          `${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
