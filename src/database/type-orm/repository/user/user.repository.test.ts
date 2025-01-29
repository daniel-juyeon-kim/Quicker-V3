import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BirthDate, JoinDate, Order, ProfileImage, User } from '../../entity';
import { TestTypeormModule } from '../../test-typeorm.module';
import { DataBaseError, NotExistDataError } from '../../util';
import { UserRepository } from './user.repository';

let testModule: TestingModule;
let repository: UserRepository;
let ormRepository: Repository<Order>;

beforeAll(async () => {
  testModule = await Test.createTestingModule({
    imports: [TestTypeormModule, TypeOrmModule.forFeature([User])],
    providers: [UserRepository],
  }).compile();

  repository = testModule.get(UserRepository);
  ormRepository = testModule.get(getRepositoryToken(User));
});

const createUser = async (manager: EntityManager) => {
  const user = manager.create(User, {
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

  await manager.save(User, user);
};

afterEach(async () => {
  await ormRepository.clear();
});

afterAll(async () => {
  await testModule.close();
});

describe('UserRepository 테스트', () => {
  describe('insert', () => {
    describe('create 테스트', () => {
      test('통과하는 테스트', async () => {
        const userId = '아이디';

        await expect(
          ormRepository.manager.existsBy(User, { id: userId }),
        ).resolves.toBe(false);
        await expect(
          ormRepository.manager.existsBy(ProfileImage, { id: userId }),
        ).resolves.toBe(false);
        await expect(
          ormRepository.manager.existsBy(BirthDate, { id: userId }),
        ).resolves.toBe(false);
        await expect(
          ormRepository.manager.existsBy(JoinDate, { id: userId }),
        ).resolves.toBe(false);

        const user = {
          id: userId,
          walletAddress: '지갑주소',
          name: '이름',
          email: '이메일',
          contact: '연락처',
        };

        const birthDate = new Date(2000, 9, 12);

        await repository.create({ user, birthDate, id: userId });

        const userInstance = await ormRepository.manager.findOne(User, {
          relations: {
            profileImage: true,
            birthDate: true,
            joinDate: true,
          },
          where: { id: userId },
        });

        expect(userInstance).not.toBeFalsy();
        expect(userInstance?.profileImage).not.toBeFalsy();
        expect(userInstance?.birthDate).not.toBeFalsy();
        expect(userInstance?.joinDate).not.toBeFalsy();
      });

      test('실패하는 테스트, 이미 존재하는 아이디', async () => {
        const userId = '아이디';
        const user = {
          id: userId,
          walletAddress: '지갑주소',
          name: '이름',
          email: '이메일',
          contact: '연락처',
        };

        const birthDate = new Date(2000, 9, 12);

        await expect(
          repository.create({ user, birthDate, id: userId }),
        ).resolves.not.toThrow();
        await expect(
          repository.create({ user, birthDate, id: userId }),
        ).rejects.toBeInstanceOf(DataBaseError);
        await expect(
          repository.create({ user, birthDate, id: userId }),
        ).rejects.toThrow('아이디에 해당하는 데이터가 이미 존재합니다.');
      });
    });
  });

  describe('select', () => {
    beforeEach(async () => {
      await createUser(ormRepository.manager);
    });

    describe('findNameByWalletAddress 테스트', () => {
      test('통과하는 테스트', async () => {
        await expect(
          repository.findNameByWalletAddress('지갑주소'),
        ).resolves.toEqual({ name: '이름' });
      });

      test('실패하는 테스트, 존재하지 않는 데이터에 접근', async () => {
        const walletAddress = '잘못된_지갑주소';

        await expect(
          repository.findNameByWalletAddress(walletAddress),
        ).rejects.toBeInstanceOf(NotExistDataError);
        await expect(
          repository.findNameByWalletAddress(walletAddress),
        ).rejects.toThrow(
          '지갑주소 잘못된_지갑주소에 대응되는 데이터가 존재하지 않습니다.',
        );
      });
    });

    describe('findUserProfileImageIdByWalletAddress 테스트', () => {
      test('통과하는 테스트', async () => {
        await expect(
          repository.findUserProfileImageIdByWalletAddress('지갑주소'),
        ).resolves.toEqual({
          imageId: '111',
        });
      });

      test('실패하는 테스트, 존재하지 않는 데이터에 접근', async () => {
        const walletAddress = '잘못된_지갑주소';

        await expect(
          repository.findUserProfileImageIdByWalletAddress(walletAddress),
        ).rejects.toBeInstanceOf(NotExistDataError);
        await expect(
          repository.findUserProfileImageIdByWalletAddress(walletAddress),
        ).rejects.toThrow(
          '지갑주소 잘못된_지갑주소에 대응되는 데이터가 존재하지 않습니다.',
        );
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

        const findProfileImageId = async (walletAddress: string) => {
          const profileImage = await ormRepository.manager.findOne(
            ProfileImage,
            {
              relations: { user: true },
              where: { user: { walletAddress } },
              select: {
                id: true,
                imageId: true,
                user: {},
              },
            },
          );

          return { imageId: profileImage?.imageId };
        };

        await expect(findProfileImageId(walletAddress)).resolves.toEqual({
          imageId: '111',
        });

        const body = { walletAddress, imageId: '100' };

        await repository.updateUserProfileImageIdByWalletAddress(body);

        await expect(findProfileImageId(walletAddress)).resolves.toEqual({
          imageId: '100',
        });
      });

      test('실패하는 테스트, 존재하지 않는 지갑주소', async () => {
        const body = {
          walletAddress: '존재하지 않는 지갑주소',
          imageId: '100',
        };

        await expect(
          repository.updateUserProfileImageIdByWalletAddress(body),
        ).rejects.toBeInstanceOf(DataBaseError);
        await expect(
          repository.updateUserProfileImageIdByWalletAddress(body),
        ).rejects.toBeInstanceOf(NotExistDataError);
        await expect(
          repository.updateUserProfileImageIdByWalletAddress(body),
        ).rejects.toThrow(
          '존재하지 않는 지갑주소에 대응되는 데이터가 존재하지 않습니다.',
        );
      });
    });
  });
});
