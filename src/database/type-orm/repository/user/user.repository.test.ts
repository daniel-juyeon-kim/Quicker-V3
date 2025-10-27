import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { UserBuilder } from '../../../../../test/builder/user.builder';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import { ProfileImageEntity, UserEntity } from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let testModule: TestingModule;
  let repository: UserRepository;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([UserEntity]),
        ClsModule,
      ],
      providers: [UserRepository, TransactionManager],
    }).compile();

    repository = testModule.get(UserRepository);
    manager = testModule.get(EntityManager);
    cls = ClsServiceManager.getClsService();
  });

  afterEach(async () => {
    await manager.clear(UserEntity);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('createUser', () => {
    test('통과하는 테스트', async () => {
      const userId = '아이디';
      const user = {
        id: userId,
        walletAddress: '지갑주소',
        name: '이름',
        email: '이메일',
        contact: '연락처',
      };
      const birthDate = new Date(2000, 9, 12);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await repository.createUser({ id: userId, user, birthDate });
      });

      const userInstance = await manager.findOne(UserEntity, {
        relations: {
          profileImage: true,
          birthDate: true,
          joinDate: true,
        },
        where: { id: userId },
      });
      expect(userInstance.profileImage).toBeTruthy();
      expect(userInstance.birthDate).toBeTruthy();
      expect(userInstance.joinDate).toBeTruthy();
    });

    test('실패하는 테스트, 이미 존재하는 사용자의 아이디를 입력하면 DuplicatedDataException을 던짐', async () => {
      const userId = '아이디';
      const user = {
        id: userId,
        walletAddress: '지갑주소',
        name: '이름',
        email: '이메일',
        contact: '연락처',
      };
      const birthDate = new Date(2000, 9, 12);
      const error = new DuplicatedDataException(userId);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        // 사용자 생성
        await expect(
          repository.createUser({ user, birthDate, id: userId }),
        ).resolves.not.toThrow();

        // 중복 데이터 입력, 에러 던짐
        await expect(
          repository.createUser({ user, birthDate, id: userId }),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findNameByWalletAddress', () => {
    beforeEach(async () => {
      const user = new UserBuilder()
        .withId('아이디')
        .withWalletAddress('지갑주소')
        .withName('이름')
        .withEmail('이메일')
        .withContact('연락처')
        .withProfileImageId('111')
        .build();
      await manager.save(UserEntity, user);
    });

    afterEach(async () => {
      await manager.clear(UserEntity);
    });

    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const result = { name: '이름' };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findNameByWalletAddress(walletAddress),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소를 입력하면 NotExistDataException을 던짐', async () => {
      const walletAddress = '0x23h298fhooweifhoi82938';
      const error = new NotExistDataException(walletAddress);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findNameByWalletAddress(walletAddress),
        ).rejects.toEqual(error);
      });
    });
  });

  describe('findUserProfileImageIdByWalletAddress', () => {
    beforeEach(async () => {
      const user = new UserBuilder()
        .withId('아이디')
        .withWalletAddress('지갑주소')
        .withName('이름')
        .withEmail('이메일')
        .withContact('연락처')
        .withProfileImageId('111')
        .build();
      await manager.save(UserEntity, user);
    });

    afterEach(async () => {
      await manager.clear(UserEntity);
    });

    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const result = { imageId: '111' };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findProfileImageIdByWalletAddress(walletAddress),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소를 입력하면 NotExistDataException을 던짐', async () => {
      const walletAddress = '0x23h298fhooweifhoi82938';
      const error = new NotExistDataException(walletAddress);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findProfileImageIdByWalletAddress(walletAddress),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('updateUserProfileImageIdByWalletAddress', () => {
    beforeEach(async () => {
      const user = new UserBuilder()
        .withId('아이디')
        .withWalletAddress('지갑주소')
        .withName('이름')
        .withEmail('이메일')
        .withContact('연락처')
        .withProfileImageId('111')
        .build();
      await manager.save(UserEntity, user);
    });

    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const { id } = await manager.findOne(UserEntity, {
        where: { walletAddress },
        select: { id: true },
      });
      const updateDto = { walletAddress, imageId: '100' };
      const result = { imageId: '100' };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await repository.updateUserProfileImageIdByWalletAddress(updateDto);
      });

      await expect(
        manager.findOne(ProfileImageEntity, {
          where: { id },
          select: { imageId: true },
        }),
      ).resolves.toEqual(result);
    });

    test('실패하는 테스트, 회원으로 등록되지 않은 지갑주소로 이미지 아이디를 업데이트하면 NotExistDataException을 던짐', async () => {
      const walletAddress = '0x23h298fhooweifhoi82938';
      const dto = {
        walletAddress,
        imageId: '100',
      };
      const error = new NotExistDataException(walletAddress);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.updateUserProfileImageIdByWalletAddress(dto),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findIdByWalletAddress', () => {
    beforeEach(async () => {
      const user = new UserBuilder()
        .withId('아이디')
        .withWalletAddress('지갑주소')
        .withName('이름')
        .withEmail('이메일')
        .withContact('연락처')
        .withProfileImageId('111')
        .build();
      await manager.save(UserEntity, user);
    });

    afterEach(async () => {
      await manager.clear(UserEntity);
    });

    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const expectedId = '아이디';

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        const userId = await repository.findIdByWalletAddress(walletAddress);
        expect(userId).toEqual(expectedId);
      });
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소를 입력하면 NotExistDataException을 던짐', async () => {
      const walletAddress = '없는 지갑주소';
      const error = new NotExistDataException(walletAddress);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findIdByWalletAddress(walletAddress),
        ).rejects.toEqual(error);
      });
    });
  });
});
