import { Test, TestingModule } from '@nestjs/testing';
import { KeyCreator } from '@src/core/module';
import {
  DuplicatedDataError,
  IUserRepository,
  NotExistDataError,
  ProfileImageEntity,
  UserEntity,
} from '@src/database';
import { mock, mockClear } from 'jest-mock-extended';
import { UserService } from './user.service';

describe('UserService 테스트', () => {
  let service: UserService;
  const repository = mock<IUserRepository>();
  const dbUserPkCreator = mock<KeyCreator>();

  beforeEach(async () => {
    mockClear(repository);
    mockClear(dbUserPkCreator);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'IUserRepository', useValue: repository },
        { provide: KeyCreator, useValue: dbUserPkCreator },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createUser 테스트', () => {
    test('통과하는 테스트', async () => {
      const dto = {
        walletAddress: '지갑주소',
        name: '이름',
        email: '이메일',
        contact: '연락처',
        birthDate: '2000/01/01',
      };
      const mockRepositoryCalledValue = {
        id: undefined,
        birthDate: new Date(2000, 0, 1),
        user: {
          contact: '연락처',
          email: '이메일',
          name: '이름',
          walletAddress: '지갑주소',
        },
      };
      const result = undefined;

      await expect(service.createUser(dto)).resolves.toEqual(result);
      expect(repository.create).toHaveBeenCalledWith(mockRepositoryCalledValue);
    });

    test('실패하는 테스트, 중복 회원 가입', async () => {
      const dto = {
        walletAddress: '지갑주소',
        name: '이름',
        email: '이메일',
        contact: '연락처',
        birthDate: '2000/01/01',
      };
      const error = new DuplicatedDataError(
        `에 해당하는 데이터가 이미 존재합니다.`,
      );
      // 사용자 생성
      await expect(service.createUser(dto)).resolves.toEqual(undefined);
      repository.create.mockRejectedValue(error);

      // 사용자 중복생성
      await expect(service.createUser(dto)).rejects.toEqual(error);
      expect(repository.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('findUserNameByWalletAddress 테스트', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const resolvedValue = { name: '이름' } as UserEntity;
      repository.findNameByWalletAddress.mockResolvedValue(resolvedValue);

      await expect(
        service.findUserNameByWalletAddress(walletAddress),
      ).resolves.toEqual(resolvedValue);
      expect(repository.findNameByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소', async () => {
      const walletAddress = '존재하지 않는 지갑주소';
      const ERROR_MESSAGE = `지갑주소 ${walletAddress}에 대응되는 데이터가 존재하지 않습니다.`;
      const error = new NotExistDataError(ERROR_MESSAGE);
      repository.findNameByWalletAddress.mockRejectedValue(error);

      await expect(
        service.findUserNameByWalletAddress(walletAddress),
      ).rejects.toStrictEqual(error);
      expect(repository.findNameByWalletAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserImageId 테스트', () => {
    test('통과하는 테스트', async () => {
      const walletAddress = '지갑주소';
      const expectReturnValue = { imageId: '300' } as ProfileImageEntity;
      repository.findUserProfileImageIdByWalletAddress.mockResolvedValue(
        expectReturnValue,
      );

      await expect(service.findUserImageId(walletAddress)).resolves.toEqual(
        expectReturnValue,
      );
      expect(
        repository.findUserProfileImageIdByWalletAddress,
      ).toHaveBeenCalledWith(walletAddress);
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소', async () => {
      const walletAddress = '존재하지 않는 지갑주소';
      const error = new NotExistDataError('');
      repository.findUserProfileImageIdByWalletAddress.mockRejectedValue(error);

      await expect(service.findUserImageId(walletAddress)).rejects.toEqual(
        error,
      );
    });
  });

  describe('updateUserImageId 테스트', () => {
    test('통과하는 테스트', async () => {
      const dto = { walletAddress: '지갑주소', imageId: '100' };

      await service.updateUserImageId(dto);

      expect(
        repository.updateUserProfileImageIdByWalletAddress,
      ).toHaveBeenCalledWith(dto);
    });

    test('실패하는 테스트, 존재하지 않는 지갑주소', async () => {
      const dto = { walletAddress: '존재하지 않는 지갑주소', imageId: '100' };
      const error = new NotExistDataError('');
      repository.updateUserProfileImageIdByWalletAddress.mockRejectedValue(
        error,
      );

      await expect(service.updateUserImageId(dto)).rejects.toEqual(error);
    });
  });
});
