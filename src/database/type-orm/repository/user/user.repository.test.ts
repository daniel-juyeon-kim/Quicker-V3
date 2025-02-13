import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import { OrderEntity, ProfileImageEntity, UserEntity } from '../../entity';
import { DuplicatedDataError, NotExistDataError } from '../../util';
import { UserRepository } from './user.repository';

const createUser = async (manager: EntityManager) => {
  const user = manager.create(UserEntity, {
    id: '아이디',
    walletAddress: '지갑주소',
    name: '이름',
    email: '이메일',
    contact: '연락처',
    birthDate: {
      id: '아이디',
      date: new Date(2000, 9, 12).toISOString(),
    },
    profileImage: {
      id: '아이디',
      imageId: '111',
    },
    joinDate: {
      id: '아이디',
      date: new Date(2023, 9, 12).toISOString(),
    },
  });

  await manager.save(UserEntity, user);
};

describe('UserRepository', () => {
  let testModule: TestingModule;
  let repository: UserRepository;
  let ormRepository: Repository<OrderEntity>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestTypeormModule, TypeOrmModule.forFeature([UserEntity])],
      providers: [UserRepository],
    }).compile();

    repository = testModule.get(UserRepository);
    ormRepository = testModule.get(getRepositoryToken(UserEntity));
  });

  afterEach(async () => {
    await ormRepository.clear();
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('UserRepository 테스트', () => {
    describe('create', () => {
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

          await repository.createUser({ id: userId, user, birthDate });

          const userInstance = await ormRepository.manager.findOne(UserEntity, {
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

        test('실패하는 테스트, 이미 존재하는 아이디는 DuplicatedDataError를 던짐', async () => {
          const userId = '아이디';
          const user = {
            id: userId,
            walletAddress: '지갑주소',
            name: '이름',
            email: '이메일',
            contact: '연락처',
          };
          const birthDate = new Date(2000, 9, 12);
          const error = new DuplicatedDataError(
            `${userId}에 해당하는 데이터가 이미 존재합니다.`,
          );

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

    describe('find', () => {
      beforeEach(async () => {
        await createUser(ormRepository.manager);
      });

      afterEach(async () => {
        await ormRepository.manager.clear(UserEntity);
      });

      describe('findNameByWalletAddress', () => {
        test('통과하는 테스트', async () => {
          const walletAddress = '지갑주소';
          const result = { name: '이름' };

          await expect(
            repository.findNameByWalletAddress(walletAddress),
          ).resolves.toEqual(result);
        });

        test('실패하는 테스트, 존재하지 않는 데이터에 접근하면 NotExistDataError를 던짐', async () => {
          const walletAddress = '0x23h298fhooweifhoi82938';
          const error = new NotExistDataError(
            `지갑주소 ${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
          );

          await expect(
            repository.findNameByWalletAddress(walletAddress),
          ).rejects.toEqual(error);
        });
      });

      describe('findUserProfileImageIdByWalletAddress', () => {
        test('통과하는 테스트', async () => {
          const walletAddress = '지갑주소';
          const result = { imageId: '111' };

          await expect(
            repository.findUserProfileImageIdByWalletAddress(walletAddress),
          ).resolves.toEqual(result);
        });

        test('실패하는 테스트, 존재하지 않는 데이터에 접근하면 NotExistDataError를 던짐', async () => {
          const walletAddress = '0x23h298fhooweifhoi82938';
          const error = new NotExistDataError(
            `지갑주소 ${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
          );

          await expect(
            repository.findUserProfileImageIdByWalletAddress(walletAddress),
          ).rejects.toStrictEqual(error);
        });
      });
    });

    describe('update', () => {
      beforeEach(async () => {
        await createUser(ormRepository.manager);
      });

      describe('updateUserProfileImageIdByWalletAddress 테스트', () => {
        test('통과하는 테스트', async () => {
          const walletAddress = '지갑주소';
          const { id } = await ormRepository.manager.findOne(UserEntity, {
            where: { walletAddress },
            select: { id: true },
          });
          const updateDto = { walletAddress, imageId: '100' };
          const result = { imageId: '100' };

          await repository.updateUserProfileImageIdByWalletAddress(updateDto);

          await expect(
            ormRepository.manager.findOne(ProfileImageEntity, {
              where: { id },
              select: { imageId: true },
            }),
          ).resolves.toEqual(result);
        });

        test('실패하는 테스트, 회원으로 등록되지 않은 지갑주소로 이미지 아이디를 업데이트하면 NotExistDataError를 던짐', async () => {
          const walletAddress = '0x23h298fhooweifhoi82938';
          const dto = {
            walletAddress,
            imageId: '100',
          };
          const error = new NotExistDataError(
            `${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`,
          );

          await expect(
            repository.updateUserProfileImageIdByWalletAddress(dto),
          ).rejects.toStrictEqual(error);
        });
      });
    });
  });
});
